import { NextRequest, NextResponse } from "next/server";
import { withAuth, isAuthError } from "@/lib/auth-guard";
import { createServiceClient } from "@repo/db/server";
import { createBillSplit, getBillSplitsForConnection } from "@repo/db/queries/billSplits";
import { getConnectionById } from "@repo/db/queries/connections";

function nairaStr(kobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

// GET /api/splits?connectionId=xxx  — list all splits for a connection
export async function GET(req: NextRequest) {
  const auth = await withAuth();
  if (isAuthError(auth)) return auth.error;
  const { user } = auth;

  const connectionId = req.nextUrl.searchParams.get("connectionId");
  if (!connectionId) {
    return NextResponse.json({ error: "connectionId is required" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: conn } = await getConnectionById(supabase as any, connectionId);
  if (!conn || (conn.requester_id !== user.id && conn.receiver_id !== user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await getBillSplitsForConnection(supabase as any, connectionId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ splits: data ?? [] });
}

// POST /api/splits  — create a new bill split
export async function POST(req: NextRequest) {
  const auth = await withAuth();
  if (isAuthError(auth)) return auth.error;
  const { user } = auth;

  const body = await req.json() as {
    connectionId?: string;
    title?: string;
    description?: string;
    totalAmount?: number;
    shares?: { userId: string; amount: number; description?: string }[];
  };

  const { connectionId, title, totalAmount, shares } = body;

  if (!connectionId || !title?.trim() || !totalAmount || !shares?.length) {
    return NextResponse.json(
      { error: "connectionId, title, totalAmount, and shares are required" },
      { status: 400 }
    );
  }
  if (totalAmount <= 0) {
    return NextResponse.json({ error: "totalAmount must be positive" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  // Verify membership
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: conn } = await getConnectionById(supabase as any, connectionId);
  if (!conn || (conn.requester_id !== user.id && conn.receiver_id !== user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (conn.status !== "ACTIVE") {
    return NextResponse.json({ error: "Connection is not active" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await createBillSplit(supabase as any, {
    connectionId,
    createdBy: user.id,
    title: title.trim(),
    description: body.description?.trim(),
    totalAmount,
    shares,
  });

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Failed to create split" }, { status: 500 });
  }

  // ── Chat message + notification ────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const connAny = conn as any;
  const actorName: string =
    (conn.requester_id === user.id ? connAny.requester?.display_name : connAny.receiver?.display_name) ?? "Your roommate";
  const otherUserId: string =
    conn.requester_id === user.id ? conn.receiver_id : conn.requester_id;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Inject a bill_split system message so it appears in the chat thread
  await db.from("messages").insert({
    connection_id: connectionId,
    sender_id: user.id,
    content: JSON.stringify({
      event: "created",
      split_id: data.id,
      title: title.trim(),
      total_naira: nairaStr(totalAmount),
      creator_name: actorName,
    }),
    message_type: "bill_split",
  });

  // Notify the other user
  await db.from("notifications").insert({
    user_id: otherUserId,
    type: "BILL_SPLIT_CREATED",
    title: "New bill split",
    body: `${actorName} created "${title.trim()}" — ${nairaStr(totalAmount)}`,
    data: { connection_id: connectionId, split_id: data.id },
  });

  return NextResponse.json({ split: data }, { status: 201 });
}
