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
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action } = body as { action?: string };
  if (action !== "decline") {
    return NextResponse.json({ error: "action must be 'decline'" }, { status: 400 });
  }

  const db = await createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: agreement } = await (db as any)
    .from("roommate_agreements")
    .select(`
      id, connection_id, initiator_id, status,
      connection:connections!connection_id(id, requester_id, receiver_id)
    `)
    .eq("id", id)
    .single();

  if (!agreement) return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
  if (agreement.status !== "PENDING") {
    return NextResponse.json({ error: "Only pending agreements can be declined" }, { status: 400 });
  }

  const connection = agreement.connection;
  const isParty = connection.requester_id === user.id || connection.receiver_id === user.id;
  if (!isParty) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (agreement.initiator_id === user.id) {
    return NextResponse.json({ error: "The initiator cannot decline their own proposal" }, { status: 403 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateErr } = await (db as any)
    .from("roommate_agreements")
    .update({ status: "DECLINED" })
    .eq("id", id);

  if (updateErr) {
    return NextResponse.json({ error: "Failed to decline agreement" }, { status: 500 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (db as any)
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const name = profile?.display_name ?? "Your connection";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any).from("messages").insert({
    connection_id: agreement.connection_id,
    sender_id: user.id,
    content: JSON.stringify({ agreement_id: id, declined_by_name: name }),
    message_type: "agreement_declined",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any).from("notifications").insert({
    user_id: agreement.initiator_id,
    type: "AGREEMENT_DECLINED",
    title: "Agreement declined",
    body: `${name} declined the roommate agreement.`,
    data: { connection_id: agreement.connection_id, agreement_id: id },
  });

  return NextResponse.json({ success: true, status: "DECLINED" });
}
