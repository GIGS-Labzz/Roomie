"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { createClient } from "@repo/db/client";
import type { Database } from "@repo/db/types";
import { useAuth } from "@/context/AuthContext";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

let lastSeenUpdated = false;

function baseUsername(profile: Profile, userEmail?: string | null) {
  const firstName = (profile.display_name ?? userEmail?.split("@")[0] ?? "user")
    .trim()
    .split(/\s+/)[0]
    ?.toLowerCase()
    .replace(/[^a-z0-9_]/g, "");

  return firstName || "user";
}

async function createMissingUsername(profile: Profile, userEmail?: string | null) {
  const supabase = createClient();
  const base = baseUsername(profile, userEmail);

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const suffix = Math.floor(Math.random() * 100).toString().padStart(2, "0");
    const username = `${base}${suffix}`;
    const { data, error } = await (supabase as any)
      .from("profiles")
      .update({ username, updated_at: new Date().toISOString() })
      .eq("id", profile.id)
      .select()
      .single();

    if (!error && data) return data as Profile;
    if (error?.code !== "23505") throw error;
  }

  throw new Error("Could not generate a unique username.");
}

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

  useEffect(() => {
    if (!user || !profile || profile.username?.trim()) return;

    let cancelled = false;
    createMissingUsername(profile, user.email)
      .then(async (updated) => {
        if (!cancelled) await mutate(updated, false);
      })
      .catch((err) => {
        console.error("Failed to auto-create username:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [profile, mutate, user]);

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
