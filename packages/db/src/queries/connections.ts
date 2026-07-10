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
       requester:profiles!requester_id(id, display_name, username, avatar_url, university, city, student_verified),
       receiver:profiles!receiver_id(id, display_name, username, avatar_url, university, city, student_verified),
       roommate_agreements(status)`
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
       requester:profiles!requester_id(id, display_name, username, avatar_url, university, city, student_verified),
       receiver:profiles!receiver_id(id, display_name, username, avatar_url, university, city, student_verified)`
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
    .select("*, roommate_agreements(status)")
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
      requester_id,
      receiver_id,
      requester:profiles!requester_id(id, display_name, username, avatar_url, university, city, student_verified, bio),
      receiver:profiles!receiver_id(id, display_name, username, avatar_url, university, city, student_verified, bio)
    `)
    .eq("status", "ACTIVE")
    .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);
}

export async function getMutualConnections(
  supabase: SupabaseClient<Database>,
  userAId: string,
  userBId: string
) {
  const [aIds, bIds] = await Promise.all([
    getConnectedUserIds(supabase, userAId),
    getConnectedUserIds(supabase, userBId),
  ]);

  const bSet = new Set(bIds);
  const mutualIds = aIds.filter(
    (id) => bSet.has(id) && id !== userAId && id !== userBId
  );

  if (mutualIds.length === 0) return [];

  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, username, avatar_url")
    .in("id", mutualIds);

  return data ?? [];
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
      initiator_id,
      acceptor_id,
      initiator:profiles!initiator_id(id, display_name, avatar_url, university, city, student_verified, bio),
      acceptor:profiles!acceptor_id(id, display_name, avatar_url, university, city, student_verified, bio)
    `)
    .eq("status", "CONFIRMED")
    .or(`initiator_id.eq.${userId},acceptor_id.eq.${userId}`);
}

export async function getConnectionMap(
  supabase: SupabaseClient<Database>,
  targetUserId: string,
  currentUserId: string
) {
  // 1. Fetch target user profile
  const { data: targetProfile, error: profileErr } = await supabase
    .from("profiles")
    .select("id, display_name, username, avatar_url, university, city")
    .eq("id", targetUserId)
    .single();

  if (profileErr || !targetProfile) {
    throw new Error(profileErr?.message || "Target profile not found");
  }

  // 2. Fetch target user's active connections (1st-degree)
  const { data: firstDegreeConns, error: connErr } = await supabase
    .from("connections")
    .select(`
      id,
      requester_id,
      receiver_id,
      requester:profiles!requester_id(id, display_name, username, avatar_url, university, city),
      receiver:profiles!receiver_id(id, display_name, username, avatar_url, university, city)
    `)
    .eq("status", "ACTIVE")
    .or(`requester_id.eq.${targetUserId},receiver_id.eq.${targetUserId}`);

  if (connErr) throw connErr;

  const firstDegreeProfilesMap = new Map<string, any>();
  const firstDegreeIds: string[] = [];

  for (const c of (firstDegreeConns || [])) {
    const other = c.requester_id === targetUserId ? c.receiver : c.requester;
    if (other && other.id !== targetUserId) {
      firstDegreeProfilesMap.set(other.id, {
        ...other,
        isMutual: false,
        connections: []
      });
      firstDegreeIds.push(other.id);
    }
  }

  // 3. Fetch current user's active connections to check for mutual connections
  if (currentUserId !== targetUserId && firstDegreeIds.length > 0) {
    const { data: currentUserConns } = await supabase
      .from("connections")
      .select("requester_id, receiver_id")
      .eq("status", "ACTIVE")
      .or(`requester_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`);

    const currentUserActiveIds = new Set<string>();
    for (const c of (currentUserConns || [])) {
      currentUserActiveIds.add(c.requester_id === currentUserId ? c.receiver_id : c.requester_id);
    }

    for (const id of firstDegreeIds) {
      if (currentUserActiveIds.has(id)) {
        const prof = firstDegreeProfilesMap.get(id);
        if (prof) prof.isMutual = true;
      }
    }
  }

  // 4. Fetch 2nd-degree connections (active connections of B's 1st-degree connections)
  if (firstDegreeIds.length > 0) {
    const { data: secondDegreeConns1 } = await supabase
      .from("connections")
      .select(`
        id,
        requester_id,
        receiver_id,
        requester:profiles!requester_id(id, display_name, username, avatar_url, university, city),
        receiver:profiles!receiver_id(id, display_name, username, avatar_url, university, city)
      `)
      .eq("status", "ACTIVE")
      .in("requester_id", firstDegreeIds);

    const { data: secondDegreeConns2 } = await supabase
      .from("connections")
      .select(`
        id,
        requester_id,
        receiver_id,
        requester:profiles!requester_id(id, display_name, username, avatar_url, university, city),
        receiver:profiles!receiver_id(id, display_name, username, avatar_url, university, city)
      `)
      .eq("status", "ACTIVE")
      .in("receiver_id", firstDegreeIds);

    const secondDegreeConns = [...(secondDegreeConns1 || []), ...(secondDegreeConns2 || [])];

    for (const c of secondDegreeConns) {
      const isRequester1st = firstDegreeProfilesMap.has(c.requester_id);
      const isReceiver1st = firstDegreeProfilesMap.has(c.receiver_id);

      if (isRequester1st) {
        const first = firstDegreeProfilesMap.get(c.requester_id);
        const second = c.receiver;
        if (second && second.id !== targetUserId && !firstDegreeProfilesMap.has(second.id)) {
          if (!first.connections.some((existing: any) => existing.id === second.id)) {
            first.connections.push(second);
          }
        }
      }
      if (isReceiver1st) {
        const first = firstDegreeProfilesMap.get(c.receiver_id);
        const second = c.requester;
        if (second && second.id !== targetUserId && !firstDegreeProfilesMap.has(second.id)) {
          if (!first.connections.some((existing: any) => existing.id === second.id)) {
            first.connections.push(second);
          }
        }
      }
    }
  }

  return {
    root: targetProfile,
    connections: Array.from(firstDegreeProfilesMap.values())
  };
}

