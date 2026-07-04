import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types";

export async function getUserConnections(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  return supabase
    .from("connections")
    .select(
      `*,
       requester:profiles!requester_id(id, display_name, avatar_url, university, city, student_verified),
       receiver:profiles!receiver_id(id, display_name, avatar_url, university, city, student_verified)`
    )
    .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("updated_at", { ascending: false });
}

export async function getConnectionById(
  supabase: SupabaseClient<Database>,
  connectionId: string
) {
  return supabase
    .from("connections")
    .select(
      `*,
       requester:profiles!requester_id(id, display_name, avatar_url, university, city, student_verified),
       receiver:profiles!receiver_id(id, display_name, avatar_url, university, city, student_verified)`
    )
    .eq("id", connectionId)
    .single();
}

export async function createConnection(
  supabase: SupabaseClient<Database>,
  requesterId: string,
  receiverId: string
) {
  return supabase
    .from("connections")
    .insert({
      requester_id: requesterId,
      receiver_id: receiverId,
      status: "ACTIVE",
      connected_at: new Date().toISOString(),
    })
    .select()
    .single();
}

export async function getExistingConnection(
  supabase: SupabaseClient<Database>,
  userAId: string,
  userBId: string
) {
  return supabase
    .from("connections")
    .select("*")
    .or(
      `and(requester_id.eq.${userAId},receiver_id.eq.${userBId}),and(requester_id.eq.${userBId},receiver_id.eq.${userAId})`
    )
    .maybeSingle();
}

export async function getConnectedUserIds(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<string[]> {
  const { data } = await supabase
    .from("connections")
    .select("requester_id, receiver_id")
    .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);

  if (!data) return [];
  return data.flatMap((c) =>
    c.requester_id === userId ? [c.receiver_id] : [c.requester_id]
  );
}

export async function getActiveConnections(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  return supabase
    .from("connections")
    .select(`
      id,
      connected_at,
      requester:profiles!requester_id(id, display_name, username, avatar_url, university, city, student_verified, bio),
      receiver:profiles!receiver_id(id, display_name, username, avatar_url, university, city, student_verified, bio)
    `)
    .eq("status", "ACTIVE")
    .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);
}

export async function getConfirmedRoomies(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  return supabase
    .from("roommate_agreements")
    .select(`
      id,
      accepted_at,
      initiator:profiles!initiator_id(id, display_name, avatar_url, university, city, student_verified, bio),
      acceptor:profiles!acceptor_id(id, display_name, avatar_url, university, city, student_verified, bio)
    `)
    .eq("status", "CONFIRMED")
    .or(`initiator_id.eq.${userId},acceptor_id.eq.${userId}`);
}

