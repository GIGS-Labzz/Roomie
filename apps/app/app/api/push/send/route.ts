import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createServiceClient } from "@repo/db/server";
import { withAuth, isAuthError } from "@/lib/auth-guard";

export const runtime = "nodejs";

let isVapidConfigured = false;

function configureWebPush(): boolean {
  if (isVapidConfigured) return true;
  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (subject && publicKey && privateKey) {
    try {
      webpush.setVapidDetails(subject, publicKey, privateKey);
      isVapidConfigured = true;
      return true;
    } catch (err) {
      console.error("Failed to configure web-push VAPID details:", err);
      return false;
    }
  }
  return false;
}

interface PushRequestPayload {
  // Service mode
  userId?: string;
  title?: string;
  
  // Chat mode (user session mode)
  connectionId?: string;
  
  // Shared
  body: string;
  data?: Record<string, string>;
}

export async function POST(req: NextRequest) {
  if (!configureWebPush()) {
    return NextResponse.json(
      { error: "Push notifications are not configured (VAPID keys missing)" },
      { status: 503 }
    );
  }

  let reqBody: PushRequestPayload;
  try {
    reqBody = await req.json() as PushRequestPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { userId, title, connectionId, body, data = {} } = reqBody;
  if (!body) {
    return NextResponse.json({ error: "Message body is required" }, { status: 400 });
  }

  const db = await createServiceClient();

  let targetUserId = userId;
  let notificationTitle = title;
  const notificationData = { ...data };

  // Check authentication mode
  const authHeader = req.headers.get("authorization");
  const internalSecret = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (internalSecret && authHeader === `Bearer ${internalSecret}`) {
    // Service Role Mode
    if (!targetUserId || !notificationTitle) {
      return NextResponse.json(
        { error: "userId and title are required for service role push requests" },
        { status: 400 }
      );
    }
  } else {
    // User Session Mode
    const auth = await withAuth();
    if (isAuthError(auth)) return auth.error;
    const { user } = auth;

    if (!connectionId) {
      return NextResponse.json(
        { error: "connectionId is required for user-initiated push requests" },
        { status: 400 }
      );
    }

    // Retrieve and verify the connection
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: conn } = await (db as any)
      .from("connections")
      .select("id, requester_id, receiver_id, status")
      .eq("id", connectionId)
      .single();

    if (!conn) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    if (conn.status !== "ACTIVE") {
      return NextResponse.json({ error: "Connection is not active" }, { status: 400 });
    }

    if (conn.requester_id !== user.id && conn.receiver_id !== user.id) {
      return NextResponse.json({ error: "Forbidden: You are not a party to this connection" }, { status: 403 });
    }

    // Set target recipient (the other participant in the connection)
    targetUserId = conn.requester_id === user.id ? conn.receiver_id : conn.requester_id;

    // Fetch caller's display name for the notification title
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (db as any)
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();

    notificationTitle = profile?.display_name ?? "New Message";
    notificationData.connection_id = connectionId;
  }

  // Fetch push subscriptions for the recipient
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subs } = await (db as any)
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", targetUserId);

  if (!subs || subs.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: "No active push subscriptions for target user" });
  }

  const payload = JSON.stringify({
    title: notificationTitle,
    body: body,
    data: notificationData
  });

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
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 410 || status === 404) {
          staleEndpoints.push(sub.endpoint as string);
        }
      }
    })
  );

  // Clean up stale endpoints
  if (staleEndpoints.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any)
      .from("push_subscriptions")
      .delete()
      .in("endpoint", staleEndpoints);
  }

  return NextResponse.json({ ok: true, sent });
}
