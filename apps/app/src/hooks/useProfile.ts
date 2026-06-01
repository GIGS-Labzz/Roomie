"use client";

import { useEffect, useState } from "react";
import { createClient } from "@repo/db/client";
import type { Database } from "@repo/db/types";
import { useAuth } from "@/context/AuthContext";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }

    const supabase = createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const load = async () => {
      const { data } = await db
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(data);
      setIsLoading(false);
    };

    void load();

    db.from("profiles")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", user.id)
      .then(() => {});
  }, [user]);

  const updateProfile = async (data: Database["public"]["Tables"]["profiles"]["Update"]) => {
    if (!user) return;
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updated } = await (supabase as any)
      .from("profiles")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", user.id)
      .select()
      .single();
    if (updated) setProfile(updated);
    return updated;
  };

  return { profile, isLoading, updateProfile };
}
