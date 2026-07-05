import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@repo/db/server";

export const runtime = "nodejs";

const SUPPORT_USER_ID = "a99928a0-8de7-4da0-871a-22077d13945d";

interface BroadcastBody {
  message: string;
}

export async function POST(req: NextRequest) {
  // 1. Verify Super Admin authorization
  const clientSupabase = await createServerClient();
  const {
    data: { user },
  } = await clientSupabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: adminRow } = await (clientSupabase as any)
    .from("admin_users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!adminRow || adminRow.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
  }

  // 2. Parse request body
  const body = (await req.json()) as BroadcastBody;
  if (!body.message || !body.message.trim()) {
    return NextResponse.json({ error: "Broadcast message cannot be empty" }, { status: 400 });
  }

  const broadcastMsg = body.message.trim();

  // 3. Use Service Client to bypass RLS and broadcast as support user
  const db = await createServiceClient();

  try {
    // 4. Fetch all active student profiles (excluding support user itself)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profiles, error: fetchError } = await (db as any)
      .from("profiles")
      .select("id")
      .eq("is_active", true)
      .neq("id", SUPPORT_USER_ID);

    if (fetchError) throw fetchError;
    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ ok: true, count: 0, message: "No active profiles to broadcast to" });
    }

    // 5. Fetch all existing connections for the support user to avoid duplicates
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingConnections, error: connFetchError } = await (db as any)
      .from("connections")
      .select("id, requester_id, receiver_id")
      .or(`requester_id.eq.${SUPPORT_USER_ID},receiver_id.eq.${SUPPORT_USER_ID}`);

    if (connFetchError) throw connFetchError;

    const connectionMap = new Map<string, string>();
    existingConnections?.forEach((c: any) => {
      const otherId = c.requester_id === SUPPORT_USER_ID ? c.receiver_id : c.requester_id;
      connectionMap.set(otherId, c.id);
    });

    // 6. Bulk insert missing connections
    const newConnectionsToInsert = profiles
      .filter((p: { id: string }) => !connectionMap.has(p.id))
      .map((p: { id: string }) => ({
        requester_id: SUPPORT_USER_ID,
        receiver_id: p.id,
        status: "ACTIVE",
        connected_at: new Date().toISOString(),
      }));

    if (newConnectionsToInsert.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: insertedConns, error: connInsertError } = await (db as any)
        .from("connections")
        .insert(newConnectionsToInsert)
        .select("id, requester_id, receiver_id");

      if (connInsertError) throw connInsertError;

      insertedConns?.forEach((c: any) => {
        const otherId = c.requester_id === SUPPORT_USER_ID ? c.receiver_id : c.requester_id;
        connectionMap.set(otherId, c.id);
      });
    }

    // 7. Bulk insert broadcast messages
    const messagesToInsert = profiles
      .map((p: { id: string }) => {
        const connectionId = connectionMap.get(p.id);
        return {
          connection_id: connectionId,
          sender_id: SUPPORT_USER_ID,
          content: broadcastMsg,
          message_type: "text",
        };
      })
      .filter((m: { connection_id: string | undefined }) => m.connection_id);

    if (messagesToInsert.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: msgInsertError } = await (db as any)
        .from("messages")
        .insert(messagesToInsert);

      if (msgInsertError) throw msgInsertError;
    }

    // 8. Bulk update connection timestamps to push chats to the top
    const connectionIdsToUpdate = Array.from(connectionMap.values());
    if (connectionIdsToUpdate.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: tsUpdateError } = await (db as any)
        .from("connections")
        .update({ updated_at: new Date().toISOString() })
        .in("id", connectionIdsToUpdate);

      if (tsUpdateError) throw tsUpdateError;
    }

    return NextResponse.json({ ok: true, count: profiles.length });
  } catch (err: any) {
    console.error("Broadcast failed:", err);
    return NextResponse.json({ error: err.message || "Broadcast failed" }, { status: 500 });
  }
}
