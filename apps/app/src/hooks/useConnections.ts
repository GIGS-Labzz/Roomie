"use client";

import useSWR from "swr";
import { createClient } from "@repo/db/client";
import { useAuth } from "@/context/AuthContext";
import type { Database } from "@repo/db/types";

type Connection = Database["public"]["Tables"]["connections"]["Row"];
type ConnectionStatus = Connection["status"];

export function useConnections() {
  const { user } = useAuth();

  const { data: connections, error, mutate } = useSWR(
    user ? `connections-${user.id}` : null,
    async () => {
      const supabase = createClient();
      const { data, error: fetchError } = await (supabase as any)
        .from("connections")
        .select("*")
        .or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`);
      if (fetchError) throw fetchError;
      return (data ?? []) as Connection[];
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000, // Dedup fetches within 10 seconds
    }
  );

  const getConnectionStatus = (profileId: string): ConnectionStatus | null => {
    if (!connections) return null;
    const conn = connections.find(
      (c) => c.requester_id === profileId || c.receiver_id === profileId
    );
    return conn?.status ?? null;
  };

  return {
    connections: connections ?? [],
    isLoading: !connections && !error,
    getConnectionStatus,
    mutateConnections: mutate,
  };
}
