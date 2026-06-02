import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { withAuth, isAuthError } from "@/lib/auth-guard";
import { createServiceClient } from "@repo/db/server";
import { getBillSplitById, updateSplitItemProof } from "@repo/db/queries/billSplits";
import { getConnectionById } from "@repo/db/queries/connections";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
type AllowedMime = (typeof ALLOWED_MIME)[number];

function nairaStr(kobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

interface ClaudeReceipt {
  amount_ngn: number | null;
  confidence: "high" | "medium" | "low";
  error?: string | null;
}

/**
 * POST /api/splits/[id]/items/[itemId]/receipt
 *
 * Body: { imageData: string (base64), mimeType: string }
 *
 * Uploads the receipt to Supabase Storage, reads the amount with Claude,
 * then marks the item as fully or partially paid.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const auth = await withAuth();
  if (isAuthError(auth)) return auth.error;
  const { user } = auth;

  const { id, itemId } = await params;

  const body = await req.json() as { imageData?: string; mimeType?: string };
  const { imageData, mimeType } = body;

  if (!imageData || !mimeType) {
    return NextResponse.json({ error: "imageData and mimeType are required" }, { status: 400 });
  }
  if (!ALLOWED_MIME.includes(mimeType as AllowedMime)) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
  }

  // Validate base64 size (max ~4 MB decoded)
  if (imageData.length > 5_500_000) {
    return NextResponse.json({ error: "Image too large — max 4 MB" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  // ── Verify membership ──────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: split } = await getBillSplitById(supabase as any, id);
  if (!split) return NextResponse.json({ error: "Split not found" }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: conn } = await getConnectionById(supabase as any, split.connection_id);
  if (!conn || (conn.requester_id !== user.id && conn.receiver_id !== user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Find the specific item
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const item = (split as any).items?.find((i: any) => i.id === itemId);
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  const itemAmountKobo: number = item.amount ?? 0;

  // ── Upload receipt to Supabase Storage ────────────────────────────────
  const ext = mimeType.split("/")[1] ?? "jpg";
  const storagePath = `${id}/${itemId}/${Date.now()}.${ext}`;
  const imageBuffer = Buffer.from(imageData, "base64");

  const { error: uploadError } = await supabase.storage
    .from("receipts")
    .upload(storagePath, imageBuffer, { contentType: mimeType, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: `Storage upload failed: ${uploadError.message}` }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(storagePath);
  const proofUrl = urlData.publicUrl;

  // ── Claude reads the receipt ──────────────────────────────────────────
  let extracted: ClaudeReceipt = { amount_ngn: null, confidence: "low", error: "Analysis not attempted" };

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType as AllowedMime,
                data: imageData,
              },
            },
            {
              type: "text",
              text: `This is a payment receipt. The expected payment is ${nairaStr(itemAmountKobo)}.

Find the grand total / total amount paid on this receipt.
The currency is Nigerian Naira (₦ or NGN). Ignore individual line items.

Return ONLY valid JSON, no extra text:
{"amount_ngn": <total in naira as a number, e.g. 5000 for ₦5,000>, "confidence": "high|medium|low", "error": null}

If the receipt is unreadable, unclear, or not a payment receipt:
{"amount_ngn": null, "confidence": "low", "error": "<brief reason>"}`,
            },
          ],
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    // Strip any accidental markdown fences
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    extracted = JSON.parse(jsonStr) as ClaudeReceipt;
  } catch (err) {
    // Claude failed — still save the proof but can't auto-determine amount
    extracted = { amount_ngn: null, confidence: "low", error: String(err) };
  }

  // ── Compute payment status ────────────────────────────────────────────
  const amountPaidNgn = extracted.amount_ngn;
  const amountPaidKobo = amountPaidNgn !== null ? Math.round(amountPaidNgn * 100) : 0;

  let paymentStatus: "full" | "partial" | "unpaid";
  let balance = 0;

  if (amountPaidNgn === null || amountPaidKobo <= 0) {
    // Claude couldn't read it — save proof but leave user to mark manually
    paymentStatus = "unpaid";
    balance = itemAmountKobo;
  } else if (amountPaidKobo >= itemAmountKobo) {
    paymentStatus = "full";
    balance = 0;
  } else {
    paymentStatus = "partial";
    balance = itemAmountKobo - amountPaidKobo;
  }

  // ── Persist result ────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await updateSplitItemProof(supabase as any, itemId, {
    proofUrl,
    amountPaid: amountPaidKobo,
    paymentStatus,
  });

  if (updateError) {
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }

  // ── Inject a chat message for the payment event ───────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: conn2 } = await getConnectionById(supabase as any, split.connection_id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conn2Any = conn2 as any;
  const actorName: string =
    (conn2 && conn2.requester_id === user.id
      ? conn2Any.requester?.display_name
      : conn2Any?.receiver?.display_name) ?? "Your roommate";

  if (paymentStatus !== "unpaid" && amountPaidKobo > 0) {
    await db.from("messages").insert({
      connection_id: split.connection_id,
      sender_id: user.id,
      content: JSON.stringify({
        event: paymentStatus === "full" ? "item_paid" : "item_paid",
        split_id: split.id,
        title: split.title,
        payer_name: actorName,
        amount_naira: nairaStr(amountPaidKobo),
        ...(paymentStatus === "partial" ? { note: `balance ${nairaStr(balance)} remaining` } : {}),
      }),
      message_type: "bill_split",
    });
  }

  return NextResponse.json({
    proofUrl,
    amountPaidKobo,
    amountPaidNaira: amountPaidNgn,
    paymentStatus,
    balanceKobo: balance,
    confidence: extracted.confidence,
    readError: extracted.error ?? null,
  });
}
