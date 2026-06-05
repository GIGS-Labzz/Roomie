import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createServiceClient } from "@repo/db/server";

export const runtime = "nodejs";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

interface PushPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function POST(req: NextRequest) {
  // Internal-only: require the service role secret to prevent public access
  const authHeader = req.headers.get("authorization");
  const internalSecret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!internalSecret || authHeader !== `Bearer ${internalSecret}`) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, title, body, data = {} } = await req.json() as PushPayload;
  if (!userId || !title || !body) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subs } = await (supabase as any)
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (!subs || subs.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const payload = JSON.stringify({ title, body, data });
  let sent = 0;
  const staleEndpoints: string[] = [];

  await Promise.allSettled(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subs.map(async (sub: any) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        sent++;
      } catch (err: unknown) {
        // 410 Gone = subscription expired; clean it up
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 410 || status === 404) {
          staleEndpoints.push(sub.endpoint as string);
        }
      }
    })
  );

  // Remove expired subscriptions
  if (staleEndpoints.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("push_subscriptions")
      .delete()
      .in("endpoint", staleEndpoints);
  }

  return NextResponse.json({ ok: true, sent });
}
