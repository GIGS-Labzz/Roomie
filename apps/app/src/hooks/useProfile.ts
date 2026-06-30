"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { createClient } from "@repo/db/client";
import type { Database } from "@repo/db/types";
import { useAuth } from "@/context/AuthContext";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

let lastSeenUpdated = false;

export function useProfile() {
  const { user } = useAuth();

  const { data: profile, error, mutate } = useSWR(
    user ? `profile-${user.id}` : null,
    async () => {
      const supabase = createClient();
      const { data, error: fetchError } = await (supabase as any)
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();
      if (fetchError) throw fetchError;
      return data as Profile;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Dedup fetches within 1 minute
    }
  );

  useEffect(() => {
    if (!user || lastSeenUpdated) return;
    const supabase = createClient();
    (supabase as any)
      .from("profiles")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", user.id)
      .then(() => {
        lastSeenUpdated = true;
      });
  }, [user]);

  const updateProfile = async (data: Database["public"]["Tables"]["profiles"]["Update"]) => {
    if (!user) return;
    const supabase = createClient();
    const { data: updated, error: updateError } = await (supabase as any)
      .from("profiles")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", user.id)
      .select()
      .single();
    if (updateError) throw updateError;
    if (updated) {
      await mutate(updated, false); // Optimistically update cache without refetching
    }
    return updated;
  };

  return {
    profile: profile ?? null,
    isLoading: !profile && !error,
    updateProfile,
  };
}
