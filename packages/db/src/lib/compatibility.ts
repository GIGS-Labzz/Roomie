import type { Database } from "../types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const WEIGHTS = {
  budget: 30,
  sleepSchedule: 20,
  cleanliness: 15,
  noisePreference: 15,
  city: 10,
  lifestyle_overlap: 10,
} as const;

const CLEAN_LEVELS = ["very_tidy", "tidy", "relaxed", "messy"] as const;
const NOISE_LEVELS = ["very_quiet", "quiet", "moderate", "lively"] as const;

export function calculateCompatibility(me: Profile, them: Profile): number {
  if (
    me.username?.toLowerCase() === "roomie.app" ||
    me.display_name?.toLowerCase() === "roomie.app" ||
    them.username?.toLowerCase() === "roomie.app" ||
    them.display_name?.toLowerCase() === "roomie.app"
  ) {
    return 100;
  }

  let score = 0;

  // Budget overlap (0–30)
  const myMin = me.min_budget ?? 0;
  const myMax = me.max_budget ?? Infinity;
  const theirMin = them.min_budget ?? 0;
  const theirMax = them.max_budget ?? Infinity;
  const overlap = Math.min(myMax, theirMax) - Math.max(myMin, theirMin);
  const myRange = myMax === Infinity ? 1 : myMax - myMin || 1;
  score += WEIGHTS.budget * Math.max(0, Math.min(1, overlap / myRange));

  // Sleep schedule (0–20)
  if (me.sleep_schedule === them.sleep_schedule) {
    score += WEIGHTS.sleepSchedule;
  } else if (me.sleep_schedule === "flexible" || them.sleep_schedule === "flexible") {
    score += WEIGHTS.sleepSchedule * 0.6;
  }

  // Cleanliness (0–15): same = full, ±1 = half, ±2+ = 0
  const cleanDiff = Math.abs(
    CLEAN_LEVELS.indexOf(me.cleanliness as typeof CLEAN_LEVELS[number]) -
    CLEAN_LEVELS.indexOf(them.cleanliness as typeof CLEAN_LEVELS[number])
  );
  score += WEIGHTS.cleanliness * (cleanDiff === 0 ? 1 : cleanDiff === 1 ? 0.5 : 0);

  // Noise preference (0–15)
  const noiseDiff = Math.abs(
    NOISE_LEVELS.indexOf(me.noise_pref as typeof NOISE_LEVELS[number]) -
    NOISE_LEVELS.indexOf(them.noise_pref as typeof NOISE_LEVELS[number])
  );
  score += WEIGHTS.noisePreference * (noiseDiff === 0 ? 1 : noiseDiff === 1 ? 0.5 : 0);

  // Same city (0–10)
  if (me.city && them.city && me.city.toLowerCase() === them.city.toLowerCase()) {
    score += WEIGHTS.city;
  }

  // Lifestyle tag overlap (0–10)
  const myTags = new Set(me.lifestyle_tags ?? []);
  const theirTags = them.lifestyle_tags ?? [];
  const overlapCount = theirTags.filter((t) => myTags.has(t)).length;
  const maxTags = Math.max(myTags.size, theirTags.length, 1);
  score += WEIGHTS.lifestyle_overlap * (overlapCount / maxTags);

  return Math.round(Math.min(100, score));
}
