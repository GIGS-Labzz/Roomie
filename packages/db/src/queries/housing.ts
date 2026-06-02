import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types";

export type HousingPlatform = Database["public"]["Tables"]["housing_platforms"]["Row"];

export async function getRelevantPlatforms(
  supabase: SupabaseClient<Database>,
  filters: { city?: string | null; university?: string | null }
) {
  const { data, error } = await supabase
    .from("housing_platforms")
    .select("*")
    .eq("status", "ACTIVE")
    .order("is_featured", { ascending: false })
    .order("total_referrals", { ascending: false });

  if (error || !data) return [];

  const city = filters.city?.trim().toLowerCase();
  const university = filters.university?.trim().toLowerCase();

  const relevant = data.filter((platform) => {
    const cityMatch = city
      ? platform.cities.some((item) => item.toLowerCase() === city)
      : false;
    const campusMatch = university
      ? (platform.campus_tags ?? []).some((item) => university.includes(item.toLowerCase()))
      : false;

    return cityMatch || campusMatch;
  });

  return (relevant.length > 0 ? relevant : data) as HousingPlatform[];
}
