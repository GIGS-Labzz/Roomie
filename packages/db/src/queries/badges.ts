import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types";

export type Badge = Database["public"]["Tables"]["badges"]["Row"];
export type UserBadge = Database["public"]["Tables"]["user_badges"]["Row"];

export async function getUserBadges(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const { data, error } = await supabase
    .from("user_badges")
    .select("*, badges(*)")
    .eq("user_id", userId)
    .order("awarded_at", { ascending: false });

  if (error || !data) return [];
  return data;
}

export async function awardBadgeDirect(
  supabase: SupabaseClient<Database>,
  userId: string,
  badgeCode: string
) {
  const { data: badge, error: badgeError } = await supabase
    .from("badges")
    .select("id")
    .eq("code", badgeCode)
    .single();

  if (badgeError || !badge) return { data: null, error: badgeError };

  return supabase
    .from("user_badges")
    .upsert(
      { user_id: userId, badge_id: badge.id },
      { onConflict: "user_id,badge_id", ignoreDuplicates: true }
    )
    .select()
    .maybeSingle();
}
