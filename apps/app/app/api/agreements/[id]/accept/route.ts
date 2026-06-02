import { NextResponse } from "next/server";
import { withAuth, isAuthError } from "@/lib/auth-guard";
import { createServiceClient } from "@repo/db/server";
import { getAgreementFeeKobo, initializePaystackTransaction } from "@/lib/paystack";

export async function POST(
  _req: Request,
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
      id, connection_id, initiator_id, acceptor_id, status,
      connection:connections!connection_id(id, requester_id, receiver_id)
    `)
    .eq("id", id)
    .single();

  if (!agreement) return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
  if (agreement.status === "CONFIRMED") {
    return NextResponse.json({ confirmed: true }, { status: 200 });
  }
  if (agreement.status !== "PENDING") {
    return NextResponse.json({ error: "Agreement is not pending" }, { status: 400 });
  }
  if (agreement.initiator_id === user.id) {
    return NextResponse.json({ error: "The initiator cannot accept their own agreement" }, { status: 403 });
  }

  const connection = agreement.connection;
  const isParty = connection.requester_id === user.id || connection.receiver_id === user.id;
  if (!isParty) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const amount = getAgreementFeeKobo();
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001"}/housing`;

  try {
    const transaction = await initializePaystackTransaction({
      email: user.email ?? `${user.id}@roomie.local`,
      amount,
      callbackUrl,
      metadata: {
        agreement_id: agreement.id,
        connection_id: agreement.connection_id,
        user_id: user.id,
        type: "roommate_agreement",
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any)
      .from("roommate_agreements")
      .update({
        acceptor_id: user.id,
        amount,
        payment_reference: transaction.reference,
      })
      .eq("id", agreement.id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).from("payments").insert({
      user_id: user.id,
      connection_id: agreement.connection_id,
      reference: transaction.reference,
      amount,
      status: "PENDING",
    });

    return NextResponse.json({
      accessCode: transaction.access_code,
      authorizationUrl: transaction.authorization_url,
      reference: transaction.reference,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment initialization failed" },
      { status: 500 }
    );
  }
}
