import { NextRequest, NextResponse } from "next/server";
import { withAuth, isAuthError } from "@/lib/auth-guard";
import { createServiceClient } from "@repo/db/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth();
  if (isAuthError(auth)) return auth.error;
  const { user } = auth;

  const { id: connectionId } = await params;

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(connectionId)) {
    return NextResponse.json({ error: "Invalid connection ID" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action } = body as { action?: string };

  if (action !== "decline" && action !== "cancel") {
    return NextResponse.json({ error: "action must be 'decline' or 'cancel'" }, { status: 400 });
  }

  // Use service role for writes — auth already confirmed above
  const db = await createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: connection, error: fetchErr } = await (db as any)
    .from("connections")
    .select("id, requester_id, receiver_id, status")
    .eq("id", connectionId)
    .single();

  if (fetchErr || !connection) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  }

  const isParty = connection.requester_id === user.id || connection.receiver_id === user.id;
  if (!isParty) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (action === "decline" && connection.receiver_id !== user.id) {
    return NextResponse.json({ error: "Only the receiver can decline" }, { status: 403 });
  }

  const newStatus = action === "decline" ? "DECLINED" : "CANCELLED";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateErr } = await (db as any)
    .from("connections")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", connectionId);

  if (updateErr) {
    return NextResponse.json({ error: "Failed to update connection" }, { status: 500 });
  }

  return NextResponse.json({ success: true, status: newStatus });
}
