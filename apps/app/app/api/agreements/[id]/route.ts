import { NextRequest, NextResponse } from "next/server";
import { withAuth, isAuthError } from "@/lib/auth-guard";
import { createServiceClient } from "@repo/db/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth();
  if (isAuthError(auth)) return auth.error;
  const { user } = auth;
  const { id } = await params;

  const db = await createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: agreement } = await (db as any)
    .from("roommate_agreements")
    .select(`
      id, status, connection_id, initiator_id, acceptor_id, payment_reference, pool_roomie_id, pool_approvals,
      connection:connections!connection_id(id, requester_id, receiver_id)
    `)
    .eq("id", id)
    .single();

  if (!agreement) return NextResponse.json({ error: "Agreement not found" }, { status: 404 });

  const connection = agreement.connection;
  let isAuthorized = connection && (connection.requester_id === user.id || connection.receiver_id === user.id);
  
  if (!isAuthorized && agreement.pool_roomie_id) {
    const { data: poolMember } = await (db as any)
      .from("roommate_agreements")
      .select("id")
      .eq("roomie_id", agreement.pool_roomie_id)
      .eq("status", "CONFIRMED")
      .or(`initiator_id.eq.${user.id},acceptor_id.eq.${user.id}`)
      .limit(1);
    if (poolMember && poolMember.length > 0) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    agreement: {
      id: agreement.id,
      status: agreement.status,
      connection_id: agreement.connection_id,
      initiator_id: agreement.initiator_id,
      acceptor_id: agreement.acceptor_id,
      payment_reference: agreement.payment_reference,
      pool_roomie_id: agreement.pool_roomie_id,
      pool_approvals: agreement.pool_approvals,
    },
  });
}

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
  if (action !== "decline" && action !== "pool_approve" && action !== "pool_decline") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const db = await createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: agreement } = await (db as any)
    .from("roommate_agreements")
    .select(`
      id, connection_id, initiator_id, status, pool_roomie_id, pool_approvals,
      connection:connections!connection_id(id, requester_id, receiver_id)
    `)
    .eq("id", id)
    .single();

  if (!agreement) return NextResponse.json({ error: "Agreement not found" }, { status: 404 });

  const connection = agreement.connection;
  let isParty = connection && (connection.requester_id === user.id || connection.receiver_id === user.id);
  let isPoolMember = false;

  if (agreement.pool_roomie_id) {
    const { data: poolMember } = await (db as any)
      .from("roommate_agreements")
      .select("id")
      .eq("roomie_id", agreement.pool_roomie_id)
      .eq("status", "CONFIRMED")
      .or(`initiator_id.eq.${user.id},acceptor_id.eq.${user.id}`)
      .limit(1);
    if (poolMember && poolMember.length > 0) {
      isPoolMember = true;
    }
  }

  if (!isParty && !isPoolMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (action === "decline") {
    if (agreement.status !== "PENDING") {
      return NextResponse.json({ error: "Only pending agreements can be declined" }, { status: 400 });
    }
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

  if (action === "pool_approve") {
    if (agreement.status !== "PENDING_APPROVAL") {
      return NextResponse.json({ error: "Agreement is not pending pool approval" }, { status: 400 });
    }
    if (!isPoolMember) {
      return NextResponse.json({ error: "Only pool members can approve" }, { status: 403 });
    }

    const approvals = (agreement.pool_approvals || {}) as Record<string, string>;
    if (!(user.id in approvals)) {
      return NextResponse.json({ error: "You are not required to approve this agreement" }, { status: 403 });
    }

    approvals[user.id] = "approved";

    // Voting calculations
    const totalVoters = Object.keys(approvals).length;
    const approvedCount = Object.values(approvals).filter((v) => v === "approved").length;
    const declinedCount = Object.values(approvals).filter((v) => v === "declined").length;

    const approvalThreshold = Math.floor(totalVoters / 2) + 1;
    const declineThreshold = Math.ceil(totalVoters / 2);

    let nextStatus: "PENDING" | "DECLINED" | "PENDING_APPROVAL" = "PENDING_APPROVAL";
    if (approvedCount >= approvalThreshold) {
      nextStatus = "PENDING";
    } else if (declinedCount >= declineThreshold) {
      nextStatus = "DECLINED";
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any)
      .from("roommate_agreements")
      .update({ status: nextStatus, pool_approvals: approvals })
      .eq("id", id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (db as any)
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();
    const approverName = profile?.display_name ?? "Roommate";

    // Find connection between user and initiator to post system message
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: conn } = await (db as any)
      .from("connections")
      .select("id")
      .or(`and(requester_id.eq.${user.id},receiver_id.eq.${agreement.initiator_id}),and(requester_id.eq.${agreement.initiator_id},receiver_id.eq.${user.id})`)
      .eq("status", "ACTIVE")
      .maybeSingle();

    if (conn) {
      await (db as any).from("messages").insert({
        connection_id: conn.id,
        sender_id: user.id,
        content: `${approverName} approved adding the roommate to the pool.`,
        message_type: "system",
      });
    }

    if (nextStatus === "PENDING") {
      const inviteeId = connection.requester_id === agreement.initiator_id ? connection.receiver_id : connection.requester_id;
      
      // Notify invitee
      await (db as any).from("notifications").insert({
        user_id: inviteeId,
        type: "POOL_APPROVED",
        title: "Agreement approved by pool",
        body: `The roommate pool approved your addition! Please complete the roommate agreement payment to join.`,
        data: { connection_id: agreement.connection_id, agreement_id: id },
      });

      // Insert message in initiator-invitee thread
      await (db as any).from("messages").insert({
        connection_id: agreement.connection_id,
        sender_id: agreement.initiator_id,
        content: `The roommate pool has approved your addition. Please pay the agreement fee to join.`,
        message_type: "system",
      });
    } else if (nextStatus === "DECLINED") {
      const inviteeId = connection.requester_id === agreement.initiator_id ? connection.receiver_id : connection.requester_id;

      // Notify initiator and invitee
      await (db as any).from("notifications").insert([
        {
          user_id: agreement.initiator_id,
          type: "POOL_DECLINED",
          title: "Addition declined by pool",
          body: `The roommate pool declined adding the new roommate to your pool.`,
          data: { connection_id: agreement.connection_id, agreement_id: id },
        },
        {
          user_id: inviteeId,
          type: "POOL_DECLINED",
          title: "Addition declined",
          body: `The roommate pool declined your addition.`,
          data: { connection_id: agreement.connection_id, agreement_id: id },
        }
      ]);

      // Insert message in initiator-invitee thread
      await (db as any).from("messages").insert({
        connection_id: agreement.connection_id,
        sender_id: agreement.initiator_id,
        content: `The roommate pool has declined your addition.`,
        message_type: "system",
      });
    }

    return NextResponse.json({ success: true, status: nextStatus, approvals });
  }

  if (action === "pool_decline") {
    if (agreement.status !== "PENDING_APPROVAL") {
      return NextResponse.json({ error: "Agreement is not pending pool approval" }, { status: 400 });
    }
    if (!isPoolMember) {
      return NextResponse.json({ error: "Only pool members can decline" }, { status: 403 });
    }

    const approvals = (agreement.pool_approvals || {}) as Record<string, string>;
    if (!(user.id in approvals)) {
      return NextResponse.json({ error: "You are not required to decline this agreement" }, { status: 403 });
    }

    approvals[user.id] = "declined";

    // Voting calculations
    const totalVoters = Object.keys(approvals).length;
    const approvedCount = Object.values(approvals).filter((v) => v === "approved").length;
    const declinedCount = Object.values(approvals).filter((v) => v === "declined").length;

    const approvalThreshold = Math.floor(totalVoters / 2) + 1;
    const declineThreshold = Math.ceil(totalVoters / 2);

    let nextStatus: "PENDING" | "DECLINED" | "PENDING_APPROVAL" = "PENDING_APPROVAL";
    if (approvedCount >= approvalThreshold) {
      nextStatus = "PENDING";
    } else if (declinedCount >= declineThreshold) {
      nextStatus = "DECLINED";
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any)
      .from("roommate_agreements")
      .update({ status: nextStatus, pool_approvals: approvals })
      .eq("id", id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (db as any)
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();
    const declinerName = profile?.display_name ?? "Roommate";

    // Find connection between user and initiator to post system message
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: conn } = await (db as any)
      .from("connections")
      .select("id")
      .or(`and(requester_id.eq.${user.id},receiver_id.eq.${agreement.initiator_id}),and(requester_id.eq.${agreement.initiator_id},receiver_id.eq.${user.id})`)
      .eq("status", "ACTIVE")
      .maybeSingle();

    if (conn) {
      await (db as any).from("messages").insert({
        connection_id: conn.id,
        sender_id: user.id,
        content: `${declinerName} declined adding the roommate to the pool.`,
        message_type: "system",
      });
    }

    if (nextStatus === "PENDING") {
      const inviteeId = connection.requester_id === agreement.initiator_id ? connection.receiver_id : connection.requester_id;
      
      // Notify invitee
      await (db as any).from("notifications").insert({
        user_id: inviteeId,
        type: "POOL_APPROVED",
        title: "Agreement approved by pool",
        body: `The roommate pool approved your addition! Please complete the roommate agreement payment to join.`,
        data: { connection_id: agreement.connection_id, agreement_id: id },
      });

      // Insert message in initiator-invitee thread
      await (db as any).from("messages").insert({
        connection_id: agreement.connection_id,
        sender_id: agreement.initiator_id,
        content: `The roommate pool has approved your addition. Please pay the agreement fee to join.`,
        message_type: "system",
      });
    } else if (nextStatus === "DECLINED") {
      const inviteeId = connection.requester_id === agreement.initiator_id ? connection.receiver_id : connection.requester_id;

      // Notify initiator and invitee
      await (db as any).from("notifications").insert([
        {
          user_id: agreement.initiator_id,
          type: "POOL_DECLINED",
          title: "Addition declined by pool",
          body: `The roommate pool declined adding the new roommate to your pool.`,
          data: { connection_id: agreement.connection_id, agreement_id: id },
        },
        {
          user_id: inviteeId,
          type: "POOL_DECLINED",
          title: "Addition declined",
          body: `The roommate pool declined your addition.`,
          data: { connection_id: agreement.connection_id, agreement_id: id },
        }
      ]);

      // Insert message in initiator-invitee thread
      await (db as any).from("messages").insert({
        connection_id: agreement.connection_id,
        sender_id: agreement.initiator_id,
        content: `The roommate pool has declined your addition.`,
        message_type: "system",
      });
    }

    return NextResponse.json({ success: true, status: nextStatus, approvals });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
