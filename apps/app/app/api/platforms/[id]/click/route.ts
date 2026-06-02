import { NextRequest, NextResponse } from "next/server";
import { withAuth, isAuthError } from "@/lib/auth-guard";
import { createServiceClient } from "@repo/db/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth();
  if (isAuthError(auth)) return auth.error;
  const { user } = auth;
  const { id: platformId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { connectionId } = body as { connectionId?: string };
  if (!connectionId) return NextResponse.json({ error: "connectionId required" }, { status: 400 });

  const db = await createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: agreement } = await (db as any)
    .from("roommate_agreements")
    .select(`
      id,
      connection:connections!connection_id(id, requester_id, receiver_id)
    `)
    .eq("connection_id", connectionId)
    .eq("status", "CONFIRMED")
    .single();

  if (!agreement) return NextResponse.json({ error: "Housing is locked" }, { status: 403 });

  const connection = agreement.connection;
  const isParty = connection.requester_id === user.id || connection.receiver_id === user.id;
  if (!isParty) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any).from("platform_clicks").insert({
    platform_id: platformId,
    connection_id: connectionId,
    user_id: user.id,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: platform } = await (db as any)
    .from("housing_platforms")
    .select("total_clicks")
    .eq("id", platformId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any)
    .from("housing_platforms")
    .update({ total_clicks: (platform?.total_clicks ?? 0) + 1 })
    .eq("id", platformId);

  return NextResponse.json({ success: true });
}
