const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const db = createClient(supabaseUrl, serviceKey);

const SUPPORT_USER_ID = "a99928a0-8de7-4da0-871a-22077d13945d";
const broadcastMsg = "Test bulk announcement message";

async function run() {
  try {
    console.log("Fetching profiles...");
    const { data: profiles, error: fetchError } = await db
      .from("profiles")
      .select("id")
      .eq("is_active", true)
      .neq("id", SUPPORT_USER_ID);

    if (fetchError) throw fetchError;
    console.log(`Found ${profiles.length} active profiles.`);

    console.log("Fetching connections...");
    const { data: connections, error: connError } = await db
      .from("connections")
      .select("id, requester_id, receiver_id")
      .or(`requester_id.eq.${SUPPORT_USER_ID},receiver_id.eq.${SUPPORT_USER_ID}`);

    if (connError) throw connError;
    console.log(`Found ${connections.length} connections.`);

    const connectionMap = new Map();
    connections.forEach((c) => {
      const otherId = c.requester_id === SUPPORT_USER_ID ? c.receiver_id : c.requester_id;
      connectionMap.set(otherId, c.id);
    });

    const newConnectionsToInsert = profiles
      .filter(p => !connectionMap.has(p.id))
      .map(p => ({
        requester_id: SUPPORT_USER_ID,
        receiver_id: p.id,
        status: "ACTIVE",
        connected_at: new Date().toISOString(),
      }));

    console.log(`New connections to insert: ${newConnectionsToInsert.length}`);

    if (newConnectionsToInsert.length > 0) {
      const { data: insertedConns, error: insertConnError } = await db
        .from("connections")
        .insert(newConnectionsToInsert)
        .select("id, requester_id, receiver_id");

      if (insertConnError) throw insertConnError;
      insertedConns.forEach((c) => {
        const otherId = c.requester_id === SUPPORT_USER_ID ? c.receiver_id : c.requester_id;
        connectionMap.set(otherId, c.id);
      });
      console.log(`Inserted ${insertedConns.length} new connections.`);
    }

    const messagesToInsert = profiles.map(p => {
      const connectionId = connectionMap.get(p.id);
      return {
        connection_id: connectionId,
        sender_id: SUPPORT_USER_ID,
        content: broadcastMsg,
        message_type: "text",
      };
    }).filter(m => m.connection_id);

    console.log(`Messages to insert: ${messagesToInsert.length}`);

    if (messagesToInsert.length > 0) {
      const { error: msgInsertError } = await db
        .from("messages")
        .insert(messagesToInsert);

      if (msgInsertError) throw msgInsertError;
      console.log("Successfully inserted all messages!");
    }

    const connectionIdsToUpdate = Array.from(connectionMap.values());
    console.log(`Connections to update updated_at: ${connectionIdsToUpdate.length}`);
    if (connectionIdsToUpdate.length > 0) {
      const { error: updateError } = await db
        .from("connections")
        .update({ updated_at: new Date().toISOString() })
        .in("id", connectionIdsToUpdate);

      if (updateError) throw updateError;
      console.log("Successfully updated connections updated_at!");
    }

    console.log("Bulk broadcast test completed successfully!");

  } catch (err) {
    console.error("Caught Exception during bulk test:", err);
  }
}

run();
