import { getAgreementFeeKobo, type PaystackVerifyResponse } from "./paystack";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

export async function confirmRoommateAgreement(
  db: AnyClient,
  payment: PaystackVerifyResponse,
  fallback: { agreementId: string; connectionId: string; acceptorId: string }
) {
  const agreementId = payment.metadata?.agreement_id ?? fallback.agreementId;
  const connectionId = payment.metadata?.connection_id ?? fallback.connectionId;
  const acceptorId = payment.metadata?.user_id ?? fallback.acceptorId;

  if (payment.status !== "success") {
    throw new Error("Payment has not been completed yet");
  }
  if (payment.metadata?.type && payment.metadata.type !== "roommate_agreement") {
    throw new Error("Payment is not for a roommate agreement");
  }
  if (payment.amount < getAgreementFeeKobo()) {
    throw new Error("Payment amount is lower than the agreement fee");
  }

  const { data: agreement } = await db
    .from("roommate_agreements")
    .select("id, connection_id, initiator_id, acceptor_id, status, payment_reference, pool_roomie_id")
    .eq("id", agreementId)
    .single();

  if (!agreement) throw new Error("Agreement not found");
  if (agreement.connection_id !== connectionId) throw new Error("Payment connection mismatch");
  if (agreement.payment_reference && agreement.payment_reference !== payment.reference) {
    throw new Error("Payment reference mismatch");
  }
  if (agreement.status === "CONFIRMED") {
    return { alreadyConfirmed: true, agreement };
  }

  const paidAt = payment.paid_at ?? new Date().toISOString();

  await db
    .from("roommate_agreements")
    .update({
      status: "CONFIRMED",
      acceptor_id: acceptorId,
      accepted_at: paidAt,
      paid_at: paidAt,
      payment_reference: payment.reference,
      payment_channel: payment.channel ?? null,
      amount: payment.amount,
    })
    .eq("id", agreementId);

  await db
    .from("payments")
    .upsert(
      {
        user_id: acceptorId,
        connection_id: connectionId,
        reference: payment.reference,
        amount: payment.amount,
        status: "SUCCESS",
        payment_channel: payment.channel ?? null,
        gateway_response: payment.gateway_response ?? null,
        paid_at: paidAt,
      },
      { onConflict: "reference" }
    );

  const { data: acceptor } = await db
    .from("profiles")
    .select("display_name")
    .eq("id", acceptorId)
    .single();

  const acceptorName = acceptor?.display_name ?? "Your roommate";

  await db.from("messages").insert({
    connection_id: connectionId,
    sender_id: acceptorId,
    content: JSON.stringify({ agreement_id: agreementId, acceptor_name: acceptorName }),
    message_type: "agreement_confirmed",
  });

  const notificationsList = [
    {
      user_id: acceptorId,
      type: "AGREEMENT_CONFIRMED",
      title: "Housing unlocked",
      body: "Your roommate agreement is confirmed. Housing providers are now unlocked.",
      data: { connection_id: connectionId, agreement_id: agreementId },
    },
    {
      user_id: agreement.initiator_id,
      type: "AGREEMENT_CONFIRMED",
      title: "Agreement accepted",
      body: `${acceptorName} accepted your agreement and paid. Housing is unlocked for both of you.`,
      data: { connection_id: connectionId, agreement_id: agreementId },
    },
  ];

  await db.from("notifications").insert(notificationsList);

  // Pool Notification Logic
  if (agreement.pool_roomie_id) {
    const { data: otherAgreements } = await db
      .from("roommate_agreements")
      .select("id, connection_id, initiator_id, acceptor_id")
      .eq("roomie_id", agreement.pool_roomie_id)
      .eq("status", "CONFIRMED");

    const otherMemberIds = new Set<string>();
    for (const og of (otherAgreements ?? [])) {
      if (og.initiator_id !== acceptorId) otherMemberIds.add(og.initiator_id);
      if (og.acceptor_id && og.acceptor_id !== acceptorId) otherMemberIds.add(og.acceptor_id);
    }

    if (otherMemberIds.size > 0) {
      const idsArray = Array.from(otherMemberIds);
      
      // Notify other connections in the pool via system messages
      for (const og of (otherAgreements ?? [])) {
        if (og.connection_id !== connectionId) {
          await db.from("messages").insert({
            connection_id: og.connection_id,
            sender_id: acceptorId,
            content: `${acceptorName} has joined your roommate connection pool!`,
            message_type: "system",
          });
        }
      }

      const poolNotifications = idsArray.map((memberId) => ({
        user_id: memberId,
        type: "POOL_MEMBER_JOINED",
        title: "New roommate joined pool",
        body: `${acceptorName} has joined your roommate connection pool!`,
        data: { connection_id: connectionId, agreement_id: agreementId },
      }));

      await db.from("notifications").insert(poolNotifications);
    }
  }

  return { alreadyConfirmed: false, agreement: { ...agreement, status: "CONFIRMED" } };
}
