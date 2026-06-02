import { NextRequest, NextResponse } from "next/server";
import { withAuth, isAuthError } from "@/lib/auth-guard";
import { createServiceClient } from "@repo/db/server";
import { getBillSplitById, markSplitItemPaid, markSplitItemUnpaid } from "@repo/db/queries/billSplits";
import { getConnectionById } from "@repo/db/queries/connections";

function nairaStr(kobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

// PATCH /api/splits/[id]/items/[itemId]  — toggle paid status on a split item
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const auth = await withAuth();
  if (isAuthError(auth)) return auth.error;
  const { user } = auth;

  const { id, itemId } = await params;
  const body = await req.json() as { isPaid?: boolean };

  if (typeof body.isPaid !== "boolean") {
    return NextResponse.json({ error: "isPaid (boolean) is required" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: split, error: fetchErr } = await getBillSplitById(supabase as any, id);
  if (fetchErr || !split) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: conn } = await getConnectionById(supabase as any, split.connection_id);
  if (!conn || (conn.requester_id !== user.id && conn.receiver_id !== user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = body.isPaid
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? await markSplitItemPaid(supabase as any, itemId)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    : await markSplitItemUnpaid(supabase as any, itemId);

  if (error || !data) return NextResponse.json({ error: error?.message ?? "Failed" }, { status: 500 });

  // ── Chat message + notification ────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const connAny = conn as any;
  const actorName: string =
    (conn.requester_id === user.id ? connAny.requester?.display_name : connAny.receiver?.display_name) ?? "Your roommate";
  const otherUserId: string =
    conn.requester_id === user.id ? conn.receiver_id : conn.requester_id;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const itemData = data as any;
  const itemAmount: number = typeof itemData.amount === "number" ? itemData.amount : 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Inject a bill_split chat message for both paid and unpaid toggles
  await db.from("messages").insert({
    connection_id: split.connection_id,
    sender_id: user.id,
    content: JSON.stringify({
      event: body.isPaid ? "item_paid" : "item_unpaid",
      split_id: split.id,
      title: split.title,
      payer_name: actorName,
      amount_naira: nairaStr(itemAmount),
    }),
    message_type: "bill_split",
  });

  // Notify the other user only when marking paid (avoid notification spam on unmark)
  if (body.isPaid) {
    await db.from("notifications").insert({
      user_id: otherUserId,
      type: "BILL_SPLIT_PAID",
      title: "Share marked as paid",
      body: `${actorName} paid their share (${nairaStr(itemAmount)}) for "${split.title}"`,
      data: { connection_id: split.connection_id, split_id: split.id },
    });
  }

  return NextResponse.json({ item: data });
}
