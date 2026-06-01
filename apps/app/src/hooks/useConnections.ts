"use client";

import { useEffect, useState } from "react";
import { createClient } from "@repo/db/client";
import { useAuth } from "@/context/AuthContext";
import type { Database } from "@repo/db/types";

type Connection = Database["public"]["Tables"]["connections"]["Row"];

type ConnectionStatus = Connection["status"];

export function useConnections() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }

    const supabase = createClient();

    const load = async () => {
      setIsLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("connections")
        .select("*")
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);
      setConnections(data ?? []);
      setIsLoading(false);
    };

    void load();
  }, [user]);

  const getConnectionStatus = (profileId: string): ConnectionStatus | null => {
    const conn = connections.find(
      (c) => c.requester_id === profileId || c.receiver_id === profileId
    );
    return conn?.status ?? null;
  };

  return { connections, isLoading, getConnectionStatus };
}
