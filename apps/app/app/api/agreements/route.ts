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

  const { connectionId, poolRoomieId } = body as { connectionId?: string; poolRoomieId?: string };
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

  if (existing?.status === "PENDING_APPROVAL") {
    return NextResponse.json({ error: "An agreement is already pending approval for this connection" }, { status: 409 });
  }
  if (existing?.status === "PENDING") {
    return NextResponse.json({ error: "An agreement is already pending for this connection" }, { status: 409 });
  }
  if (existing?.status === "CONFIRMED") {
    return NextResponse.json({ error: "Agreement already confirmed" }, { status: 409 });
  }

  // If poolRoomieId is provided, retrieve existing pool members
  const otherMemberIds = new Set<string>();
  const approvalsObj: Record<string, string> = {};
  if (poolRoomieId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: poolMembers } = await (db as any)
      .from("roommate_agreements")
      .select("initiator_id, acceptor_id")
      .eq("roomie_id", poolRoomieId)
      .eq("status", "CONFIRMED");

    for (const pm of (poolMembers ?? [])) {
      if (pm.initiator_id !== user.id) otherMemberIds.add(pm.initiator_id);
      if (pm.acceptor_id && pm.acceptor_id !== user.id) otherMemberIds.add(pm.acceptor_id);
    }

    for (const mId of otherMemberIds) {
      approvalsObj[mId] = "pending";
    }
  }

  // Create (or recreate after decline) the agreement record
  let agreementId: string;
  if (existing?.status === "DECLINED") {
    // Replace the declined record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updated } = await (db as any)
      .from("roommate_agreements")
      .update({ 
        initiator_id: user.id, 
        acceptor_id: null, 
        status: poolRoomieId ? "PENDING_APPROVAL" : "PENDING", 
        payment_reference: null, 
        paid_at: null, 
        accepted_at: null,
        pool_roomie_id: poolRoomieId || null,
        pool_approvals: poolRoomieId ? approvalsObj : {}
      })
      .eq("id", existing.id)
      .select("id")
      .single();
    agreementId = updated.id;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: created, error: createErr } = await (db as any)
      .from("roommate_agreements")
      .insert({ 
        connection_id: connectionId, 
        initiator_id: user.id, 
        status: poolRoomieId ? "PENDING_APPROVAL" : "PENDING",
        pool_roomie_id: poolRoomieId || null,
        pool_approvals: poolRoomieId ? approvalsObj : {}
      })
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
    content: JSON.stringify({ agreement_id: agreementId, initiator_name: initiatorName, pool_roomie_id: poolRoomieId }),
    message_type: "agreement_request",
  });

  // Notify the other party (the invitee)
  const receiverId = connection.requester_id === user.id ? connection.receiver_id : connection.requester_id;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any).from("notifications").insert({
    user_id: receiverId,
    type: "AGREEMENT_REQUEST",
    title: "Roommate agreement proposal",
    body: poolRoomieId
      ? `${initiatorName} wants to add you to their roommate pool.`
      : `${initiatorName} wants to be your official roommate partner.`,
    data: { connection_id: connectionId, agreement_id: agreementId },
  });

  // If poolRoomieId is set, notify other pool members and insert pool_add_request messages
  if (poolRoomieId && otherMemberIds.size > 0) {
    const inviteeId = connection.requester_id === user.id ? connection.receiver_id : connection.requester_id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: inviteeProfile } = await (db as any)
      .from("profiles")
      .select("display_name")
      .eq("id", inviteeId)
      .single();
    const inviteeName = inviteeProfile?.display_name ?? "Someone";

    for (const mId of otherMemberIds) {
      const poolMemberIdsWithInitiator = [user.id, ...Array.from(otherMemberIds).filter(id => id !== mId)];
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let conn: any = null;
      for (const pId of poolMemberIdsWithInitiator) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (db as any)
          .from("connections")
          .select("id")
          .or(`and(requester_id.eq.${pId},receiver_id.eq.${mId}),and(requester_id.eq.${mId},receiver_id.eq.${pId})`)
          .eq("status", "ACTIVE")
          .maybeSingle();
        if (data) {
          conn = data;
          break;
        }
      }

      if (conn) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db as any).from("messages").insert({
          connection_id: conn.id,
          sender_id: user.id,
          content: JSON.stringify({
            agreement_id: agreementId,
            pool_roomie_id: poolRoomieId,
            initiator_name: initiatorName,
            invitee_name: inviteeName,
            invitee_id: inviteeId
          }),
          message_type: "pool_add_request",
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db as any).from("notifications").insert({
          user_id: mId,
          type: "POOL_ADD_REQUEST",
          title: "Approve roommate addition",
          body: `${initiatorName} wants to add ${inviteeName} to your roommate connection.`,
          data: { connection_id: conn.id, agreement_id: agreementId },
        });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db as any).from("notifications").insert({
          user_id: mId,
          type: "POOL_ADD_REQUEST",
          title: "Approve roommate addition",
          body: `${initiatorName} wants to add ${inviteeName} to your roommate connection.`,
          data: { agreement_id: agreementId },
        });
      }
    }
  }

  return NextResponse.json({ agreementId }, { status: 201 });
}
