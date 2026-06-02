import { NextRequest, NextResponse } from "next/server";
import { withAuth, isAuthError } from "@/lib/auth-guard";
import { createServiceClient } from "@repo/db/server";

export async function POST(req: NextRequest) {
  const auth = await withAuth();
  if (isAuthError(auth)) return auth.error;
  const { user } = auth;

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { connectionId } = body as { connectionId?: string };
  if (!connectionId) return NextResponse.json({ error: "connectionId required" }, { status: 400 });

  const db = await createServiceClient();

  // Verify caller is a party to this connection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: connection } = await (db as any)
    .from("connections")
    .select("id, requester_id, receiver_id, status")
    .eq("id", connectionId)
    .single();

  if (!connection) return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  if (connection.requester_id !== user.id && connection.receiver_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (connection.status !== "ACTIVE") {
    return NextResponse.json({ error: "Connection must be ACTIVE" }, { status: 400 });
  }

  // Check for existing non-declined agreement
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (db as any)
    .from("roommate_agreements")
    .select("id, status")
    .eq("connection_id", connectionId)
    .maybeSingle();

  if (existing?.status === "PENDING") {
    return NextResponse.json({ error: "An agreement is already pending for this connection" }, { status: 409 });
  }
  if (existing?.status === "CONFIRMED") {
    return NextResponse.json({ error: "Agreement already confirmed" }, { status: 409 });
  }

  // Create (or recreate after decline) the agreement record
  let agreementId: string;
  if (existing?.status === "DECLINED") {
    // Replace the declined record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updated } = await (db as any)
      .from("roommate_agreements")
      .update({ initiator_id: user.id, acceptor_id: null, status: "PENDING", payment_reference: null, paid_at: null, accepted_at: null })
      .eq("id", existing.id)
      .select("id")
      .single();
    agreementId = updated.id;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: created, error: createErr } = await (db as any)
      .from("roommate_agreements")
      .insert({ connection_id: connectionId, initiator_id: user.id, status: "PENDING" })
      .select("id")
      .single();
    if (createErr) {
      return NextResponse.json({ error: "Failed to create agreement", detail: createErr.message }, { status: 500 });
    }
    agreementId = created.id;
  }

  // Resolve initiator's display name for the message
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (db as any)
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const initiatorName = profile?.display_name ?? "Your connection";

  // Inject agreement_request system message into the chat
  // Content is JSON so MessageBubble can read agreement_id and initiator_name
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any).from("messages").insert({
    connection_id: connectionId,
    sender_id: user.id,
    content: JSON.stringify({ agreement_id: agreementId, initiator_name: initiatorName }),
    message_type: "agreement_request",
  });

  // Notify the other party
  const receiverId = connection.requester_id === user.id ? connection.receiver_id : connection.requester_id;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any).from("notifications").insert({
    user_id: receiverId,
    type: "AGREEMENT_REQUEST",
    title: "Roommate agreement proposal",
    body: `${initiatorName} wants to be your official roommate partner.`,
    data: { connection_id: connectionId, agreement_id: agreementId },
  });

  return NextResponse.json({ agreementId }, { status: 201 });
}
