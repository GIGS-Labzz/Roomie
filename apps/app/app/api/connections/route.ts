import { NextRequest, NextResponse } from "next/server";
import { withAuth, isAuthError } from "@/lib/auth-guard";
import { createServiceClient } from "@repo/db/server";
import { createConnection, getExistingConnection } from "@repo/db/queries/connections";

export async function POST(req: NextRequest) {
  // 1. Confirm caller is authenticated
  const auth = await withAuth();
  if (isAuthError(auth)) return auth.error;
  const { user } = auth;

  // 2. Service role for all DB writes — bypasses RLS after auth is confirmed
  const db = await createServiceClient();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { receiverId } = body as { receiverId?: string };

  if (!receiverId || typeof receiverId !== "string") {
    return NextResponse.json({ error: "receiverId is required" }, { status: 400 });
  }

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(receiverId)) {
    return NextResponse.json({ error: "Invalid receiverId" }, { status: 400 });
  }

  if (receiverId === user.id) {
    return NextResponse.json({ error: "Cannot connect with yourself" }, { status: 400 });
  }

  // 3. Verify receiver exists
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: receiverProfile } = await (db as any)
    .from("profiles")
    .select("id")
    .eq("id", receiverId)
    .maybeSingle();

  if (!receiverProfile) {
    return NextResponse.json({ error: "Receiver profile not found" }, { status: 404 });
  }

  // 4. Prevent duplicate connections
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await getExistingConnection(db as any, user.id, receiverId);
  if (existing) {
    return NextResponse.json({ connectionId: existing.id, alreadyExists: true }, { status: 200 });
  }

  // 5. Create free ACTIVE connection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: connection, error } = await createConnection(db as any, user.id, receiverId);

  if (error || !connection) {
    console.error("[connections] createConnection failed:", JSON.stringify(error));
    return NextResponse.json(
      { error: "Failed to create connection", detail: error?.message ?? "unknown" },
      { status: 500 }
    );
  }

  // 6. Notify receiver
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any).from("notifications").insert({
    user_id: receiverId,
    type: "CONNECTION_REQUEST",
    title: "New roommate connection!",
    body: "Someone connected with you on Roomie. Open the app to chat.",
    data: { connection_id: connection.id },
  });

  return NextResponse.json({ connectionId: connection.id }, { status: 201 });
}
