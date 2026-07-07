type ProfileRef = {
  id?: string | null;
  username?: string | null;
};

export function getProfileHref(profile: ProfileRef | null | undefined) {
  if (!profile) return "/discover";
  const username = profile.username?.trim();
  return username ? `/discover/${encodeURIComponent(username)}` : `/discover/${profile.id}`;
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
