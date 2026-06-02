import { NextRequest, NextResponse } from "next/server";
import { withAuth, isAuthError } from "@/lib/auth-guard";
import { createServiceClient } from "@repo/db/server";
import { getBillSplitById, settleBillSplit } from "@repo/db/queries/billSplits";
import { getConnectionById } from "@repo/db/queries/connections";

// GET /api/splits/[id]  — get a single bill split with items
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth();
  if (isAuthError(auth)) return auth.error;
  const { user } = auth;

  const { id } = await params;
  const supabase = await createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: split, error } = await getBillSplitById(supabase as any, id);
  if (error || !split) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: conn } = await getConnectionById(supabase as any, split.connection_id);
  if (!conn || (conn.requester_id !== user.id && conn.receiver_id !== user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ split });
}

// PATCH /api/splits/[id]  — settle a bill split
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth();
  if (isAuthError(auth)) return auth.error;
  const { user } = auth;

  const { id } = await params;
  const body = await req.json() as { action?: string };

  if (body.action !== "settle") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await settleBillSplit(supabase as any, id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // ── Chat message + notification ────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const connAny = conn as any;
  const actorName: string =
    (conn.requester_id === user.id ? connAny.requester?.display_name : connAny.receiver?.display_name) ?? "Your roommate";
  const otherUserId: string =
    conn.requester_id === user.id ? conn.receiver_id : conn.requester_id;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  await db.from("messages").insert({
    connection_id: split.connection_id,
    sender_id: user.id,
    content: JSON.stringify({
      event: "settled",
      split_id: split.id,
      title: split.title,
      settler_name: actorName,
    }),
    message_type: "bill_split",
  });

  await db.from("notifications").insert({
    user_id: otherUserId,
    type: "BILL_SPLIT_SETTLED",
    title: "Bill split settled",
    body: `${actorName} marked "${split.title}" as fully settled`,
    data: { connection_id: split.connection_id, split_id: split.id },
  });

  return NextResponse.json({ split: data });
}
