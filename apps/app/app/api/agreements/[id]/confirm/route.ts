import { NextRequest, NextResponse } from "next/server";
import { withAuth, isAuthError } from "@/lib/auth-guard";
import { confirmRoommateAgreement } from "@/lib/agreements";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { createServiceClient } from "@repo/db/server";

export async function POST(
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

  const { reference } = body as { reference?: string };
  if (!reference) return NextResponse.json({ error: "reference required" }, { status: 400 });

  const db = await createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: agreement } = await (db as any)
    .from("roommate_agreements")
    .select(`
      id, connection_id, initiator_id, acceptor_id, status, payment_reference,
      connection:connections!connection_id(id, requester_id, receiver_id)
    `)
    .eq("id", id)
    .single();

  if (!agreement) return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
  const connection = agreement.connection;
  const isParty = connection.requester_id === user.id || connection.receiver_id === user.id;
  if (!isParty) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (agreement.acceptor_id && agreement.acceptor_id !== user.id) {
    return NextResponse.json({ error: "Only the paying user can verify this payment" }, { status: 403 });
  }
  if (agreement.payment_reference && agreement.payment_reference !== reference) {
    return NextResponse.json({ error: "Payment reference mismatch" }, { status: 400 });
  }
  if (agreement.status === "CONFIRMED") {
    return NextResponse.json({ confirmed: true, alreadyConfirmed: true });
  }

  try {
    const payment = await verifyPaystackTransaction(reference);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await confirmRoommateAgreement(db as any, payment, {
      agreementId: agreement.id,
      connectionId: agreement.connection_id,
      acceptorId: user.id,
    });

    return NextResponse.json({ confirmed: true });
  } catch (error) {
    return NextResponse.json(
      { confirmed: false, error: error instanceof Error ? error.message : "Could not verify payment" },
      { status: 400 }
    );
  }
}
