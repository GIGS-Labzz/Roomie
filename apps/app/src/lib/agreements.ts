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
    .select("id, connection_id, initiator_id, acceptor_id, status, payment_reference")
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

  await db.from("notifications").insert([
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
  ]);

  return { alreadyConfirmed: false, agreement: { ...agreement, status: "CONFIRMED" } };
}
