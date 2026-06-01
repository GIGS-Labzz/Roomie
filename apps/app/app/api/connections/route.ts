import { NextRequest, NextResponse } from "next/server";
import { withAuth, isAuthError } from "@/lib/auth-guard";
import { createServiceClient } from "@repo/db/server";
import { createConnection, getExistingConnection } from "@repo/db/queries/connections";

// Creates an auth.users row with a specific UUID via the Admin HTTP API,
// which then fires the on_auth_user_created trigger to create the profile row.
// Used when mock profile UUIDs don't exist in the real database yet.
async function ensureReceiverExists(receiverId: string): Promise<{ ok: boolean; error?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const headers = {
    "apikey": serviceKey,
    "Authorization": `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };

  // 1. Check if the auth user already exists
  const checkRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${receiverId}`, { headers });
  if (checkRes.ok) {
    // Auth user exists — ensure profile row exists too (trigger may have missed it)
    const db = await createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).from("profiles").upsert(
      {
        id: receiverId,
        display_name: "Roommate",
        onboarding_complete: true,
        is_active: true,
      },
      { onConflict: "id", ignoreDuplicates: true }
    );
    return { ok: true };
  }

  // 2. Create the auth user with the exact UUID we need
  const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      id: receiverId,
      email: `ghost-${receiverId.slice(0, 8)}@roomie.dev`,
      email_confirm: true,
      user_metadata: {
        full_name: "Roommate",
        avatar_url: `https://i.pravatar.cc/150?u=${receiverId}`,
      },
    }),
  });

  if (!createRes.ok) {
    const body = await createRes.text();
    return { ok: false, error: `Admin API error (${createRes.status}): ${body}` };
  }

  // The on_auth_user_created trigger auto-creates the profile row.
  // Give it a brief moment, then patch to mark onboarding_complete so
  // this ghost profile doesn't interfere with the discover feed filters.
  const db = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any)
    .from("profiles")
    .update({ onboarding_complete: true, is_active: true })
    .eq("id", receiverId);

  return { ok: true };
}

export async function POST(req: NextRequest) {
  // 1. Confirm caller is authenticated
  const auth = await withAuth();
  if (isAuthError(auth)) return auth.error;
  const { user } = auth;

  // 2. Service role for all DB writes — bypasses RLS after auth is confirmed
  const db = await createServiceClient();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { receiverId } = body as { receiverId?: string };

  if (!receiverId || typeof receiverId !== "string") {
    return NextResponse.json({ error: "receiverId is required" }, { status: 400 });
  }

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(receiverId)) {
    return NextResponse.json({ error: "Invalid receiverId" }, { status: 400 });
  }

  if (receiverId === user.id) {
    return NextResponse.json({ error: "Cannot connect with yourself" }, { status: 400 });
  }

  // 3. Ensure receiver exists in auth.users + profiles (creates ghost if needed)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: receiverProfile } = await (db as any)
    .from("profiles")
    .select("id")
    .eq("id", receiverId)
    .maybeSingle();

  if (!receiverProfile) {
    const result = await ensureReceiverExists(receiverId);
    if (!result.ok) {
      console.error("[connections] ensureReceiverExists failed:", result.error);
      return NextResponse.json(
        { error: "Receiver profile not found", detail: result.error },
        { status: 404 }
      );
    }
  }

  // 4. Prevent duplicate connections
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await getExistingConnection(db as any, user.id, receiverId);
  if (existing) {
    return NextResponse.json({ connectionId: existing.id, alreadyExists: true }, { status: 200 });
  }

  // 5. Create free ACTIVE connection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: connection, error } = await createConnection(db as any, user.id, receiverId);

  if (error || !connection) {
    console.error("[connections] createConnection failed:", JSON.stringify(error));
    return NextResponse.json(
      { error: "Failed to create connection", detail: error?.message ?? "unknown" },
      { status: 500 }
    );
  }

  // 6. Notify receiver
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any).from("notifications").insert({
    user_id: receiverId,
    type: "CONNECTION_REQUEST",
    title: "New roommate connection!",
    body: "Someone connected with you on Roomie. Open the app to chat.",
    data: { connection_id: connection.id },
  });

  return NextResponse.json({ connectionId: connection.id }, { status: 201 });
}
