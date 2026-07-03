import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface DiscoveryFilters {
  city?: string[];
  university?: string[];
  gender?: string;
  minBudget?: number;
  maxBudget?: number;
  verifiedOnly?: boolean;
  tags?: string[];
  search?: string;
}

export async function getConnectedUserIds(
  supabase: SupabaseClient<Database>,
  currentUserId: string
): Promise<string[]> {
  const { data } = await supabase
    .from("connections")
    .select("requester_id, receiver_id")
    .or(`requester_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
    .in("status", ["PENDING_PAYMENT", "PAID", "ACTIVE", "DECLINED"]);

  if (!data) return [];

  return data.flatMap((c) =>
    c.requester_id === currentUserId ? [c.receiver_id] : [c.requester_id]
  );
}

export async function getDiscoveryFeed(
  supabase: SupabaseClient<Database>,
  currentUserId: string,
  filters: DiscoveryFilters = {},
  page = 0
) {
  const PAGE_SIZE = 20;

  // Also exclude blocked users
  const { data: blockData } = await supabase
    .from("blocks")
    .select("blocked_id, blocker_id")
    .or(`blocker_id.eq.${currentUserId},blocked_id.eq.${currentUserId}`);

  const blockedIds = (blockData ?? []).flatMap((b) =>
    b.blocker_id === currentUserId ? [b.blocked_id] : [b.blocker_id]
  );

  let excludeIds: string[];
  if (filters.search) {
    excludeIds = [...new Set([...blockedIds, currentUserId])];
  } else {
    const connectedIds = await getConnectedUserIds(supabase, currentUserId);
    excludeIds = [...new Set([...connectedIds, ...blockedIds, currentUserId])];
  }

  let query = supabase
    .from("profiles")
    .select(
      `id, display_name, username, avatar_url, cover_url, bio, age, gender,
       city, university, year_of_study, course,
       min_budget, max_budget, move_in_date,
       lifestyle_tags, sleep_schedule, cleanliness, noise_pref,
       student_verified, allows_smoking, allows_pets, allows_guests,
       last_seen_at, onboarding_complete, created_at, birthday, birthday_public`
    )
    .eq("is_active", true)
    .eq("onboarding_complete", true)
    .order("last_seen_at", { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`);
  }

  if (filters.search) {
    const s = `%${filters.search}%`;
    query = query.or(`display_name.ilike.${s},university.ilike.${s},course.ilike.${s},city.ilike.${s}`);
  }

  if (filters.city?.length)       query = query.in("city", filters.city);
  if (filters.university?.length) query = query.in("university", filters.university);
  if (filters.gender)             query = query.eq("gender", filters.gender as NonNullable<Profile["gender"]>);
  if (filters.minBudget)          query = query.gte("max_budget", filters.minBudget);
  if (filters.maxBudget)          query = query.lte("min_budget", filters.maxBudget);
  if (filters.verifiedOnly)       query = query.eq("student_verified", true);
  if (filters.tags?.length)       query = query.overlaps("lifestyle_tags", filters.tags);

  return query;
}

export async function getProfileById(
  supabase: SupabaseClient<Database>,
  id: string
) {
  return supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();
}

export async function updateProfile(
  supabase: SupabaseClient<Database>,
  id: string,
  data: Database["public"]["Tables"]["profiles"]["Update"]
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any)
    .from("profiles")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
}

export async function updateOnboardingStep(
  supabase: SupabaseClient<Database>,
  id: string,
  step: number,
  extra?: Database["public"]["Tables"]["profiles"]["Update"]
) {
  const isComplete = step >= 6;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any)
    .from("profiles")
    .update({
      onboarding_step: step,
      onboarding_complete: isComplete,
      ...extra,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
}

export async function updateLastSeen(
  supabase: SupabaseClient<Database>,
  id: string
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any)
    .from("profiles")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", id);
}
