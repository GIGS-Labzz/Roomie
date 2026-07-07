import type { Metadata } from "next";
import { createServiceClient } from "@repo/db/server";
import { getActiveConnections, getConfirmedRoomies } from "@repo/db/queries/connections";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.roomie.ng";

function toAbsoluteUrl(value: string) {
  if (!value) return `${APP_URL}/icons/icon-192.png`;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return `${APP_URL}${value}`;
  return `${APP_URL}/${value}`;
}

function cleanText(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim();
}

async function resolveProfile(identifier: string) {
  const supabase = await createServiceClient();
  const queryId = decodeURIComponent(identifier);

  const byId = await (supabase as any)
    .from("profiles")
    .select("id, display_name, username, avatar_url, cover_url, bio, city, university, created_at")
    .eq("id", queryId)
    .eq("is_active", true)
    .maybeSingle();

  if (byId.data) return byId.data;

  const byUsername = await (supabase as any)
    .from("profiles")
    .select("id, display_name, username, avatar_url, cover_url, bio, city, university, created_at")
    .eq("username", queryId)
    .eq("is_active", true)
    .maybeSingle();

  return byUsername.data ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const profile = await resolveProfile(id);

  if (!profile) {
    return {
      title: "Profile not found • Roomie",
      description: "Find roommates and connect with students on Roomie.",
      alternates: { canonical: `${APP_URL}/discover` },
      openGraph: {
        title: "Profile not found • Roomie",
        description: "Find roommates and connect with students on Roomie.",
        url: `${APP_URL}/discover`,
        type: "website",
        siteName: "Roomie",
        images: [{ url: `${APP_URL}/icons/icon-192.png`, width: 1200, height: 630, alt: "Roomie" }],
      },
      twitter: {
        card: "summary_large_image",
        title: "Profile not found • Roomie",
        description: "Find roommates and connect with students on Roomie.",
        images: [`${APP_URL}/icons/icon-192.png`],
      },
    };
  }

  const supabase = await createServiceClient();
  const [connectsResult, roomiesResult] = await Promise.all([
    getActiveConnections(supabase as any, profile.id),
    getConfirmedRoomies(supabase as any, profile.id),
  ]);

  const displayName = cleanText(profile.display_name) ?? "Roomie profile";
  const location = cleanText(profile.city);
  const institution = cleanText(profile.university);
  const bio = cleanText(profile.bio);
  const connectCount = connectsResult.data?.length ?? 0;
  const roomieCount = roomiesResult.data?.length ?? 0;

  const descriptionParts = [
    bio,
    location ? `Location: ${location}` : null,
    institution ? `Institution: ${institution}` : null,
    `${connectCount} connects`,
    `${roomieCount} roomies`,
  ].filter(Boolean) as string[];

  const description = descriptionParts.join(" • ");
  const profilePath = profile.username ? `/discover/${encodeURIComponent(profile.username)}` : `/discover/${profile.id}`;
  const url = `${APP_URL}${profilePath}`;
  const imageUrl = toAbsoluteUrl(profile.avatar_url ?? profile.cover_url ?? "");

  return {
    title: `${displayName} • Roomie`,
    description,
    alternates: { canonical: url },
    metadataBase: new URL(APP_URL),
    openGraph: {
      title: `${displayName} • Roomie`,
      description,
      url,
      type: "profile",
      siteName: "Roomie",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: `${displayName} on Roomie` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} • Roomie`,
      description,
      images: [imageUrl],
    },
  };
}

export default function DiscoverProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
