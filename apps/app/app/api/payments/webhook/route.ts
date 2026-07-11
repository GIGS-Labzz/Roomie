import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@repo/db/server";
import { verifyPaystackSignature, type PaystackEvent } from "@/lib/paystack";
import { confirmRoommateAgreement } from "@/lib/agreements";

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

  const payment = {
    amount: event.data.amount,
    channel: event.data.channel,
    paid_at: event.data.paid_at,
    reference: event.data.reference,
    status: "success",
    gateway_response: event.data.gateway_response,
    metadata: event.data.metadata
  };

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await confirmRoommateAgreement(db as any, payment, {
      agreementId,
      connectionId,
      acceptorId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Confirmation failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
