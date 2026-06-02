import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@repo/db/server";
import { verifyPaystackSignature, type PaystackEvent } from "@/lib/paystack";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: PaystackEvent;
  try {
    event = JSON.parse(rawBody) as PaystackEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.event !== "charge.success" || event.data.metadata?.type !== "roommate_agreement") {
    return NextResponse.json({ received: true });
  }

  const agreementId = event.data.metadata.agreement_id;
  const connectionId = event.data.metadata.connection_id;
  const acceptorId = event.data.metadata.user_id;
  if (!agreementId || !connectionId || !acceptorId) {
    return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
  }

  const db = await createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: agreement } = await (db as any)
    .from("roommate_agreements")
    .select("id, connection_id, initiator_id, acceptor_id, status")
    .eq("id", agreementId)
    .single();

  if (!agreement) return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
  if (agreement.status === "CONFIRMED") return NextResponse.json({ received: true });

  const paidAt = event.data.paid_at ?? new Date().toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any)
    .from("roommate_agreements")
    .update({
      status: "CONFIRMED",
      acceptor_id: acceptorId,
      accepted_at: paidAt,
      paid_at: paidAt,
      payment_reference: event.data.reference,
      payment_channel: event.data.channel ?? null,
      amount: event.data.amount,
    })
    .eq("id", agreementId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any)
    .from("payments")
    .upsert(
      {
        user_id: acceptorId,
        connection_id: connectionId,
        reference: event.data.reference,
        amount: event.data.amount,
        status: "SUCCESS",
        payment_channel: event.data.channel ?? null,
        gateway_response: event.data.gateway_response ?? null,
        paid_at: paidAt,
      },
      { onConflict: "reference" }
    );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: acceptor } = await (db as any)
    .from("profiles")
    .select("display_name")
    .eq("id", acceptorId)
    .single();

  const acceptorName = acceptor?.display_name ?? "Your roommate";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any).from("messages").insert({
    connection_id: connectionId,
    sender_id: acceptorId,
    content: JSON.stringify({ agreement_id: agreementId, acceptor_name: acceptorName }),
    message_type: "agreement_confirmed",
  });

  const notificationRows = [
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any).from("notifications").insert(notificationRows);

  return NextResponse.json({ received: true });
}
