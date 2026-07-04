"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@repo/db/client";

// Global cache to avoid duplicate lookup requests
const usernameToIdCache: Record<string, string> = {};

export function registerUsernameId(username: string | null | undefined, id: string) {
  if (username) {
    usernameToIdCache[username] = id;
  }
}

interface MentionLinkProps {
  username: string;
  tagText: string;
}

export function MentionLink({ username, tagText }: MentionLinkProps) {
  const [profileId, setProfileId] = useState<string | null>(usernameToIdCache[username] || null);

  useEffect(() => {
    // If we already have the profileId, no need to load it
    if (profileId) return;

    // Check cache again in case another component resolved it in the meantime
    const cachedId = usernameToIdCache[username];
    if (cachedId) {
      setProfileId(cachedId);
      return;
    }

    let isMounted = true;
    const supabase = createClient();

    const resolveUsername = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("profiles")
          .select("id")
          .eq("username", username)
          .maybeSingle();

        if (!error && data && isMounted) {
          usernameToIdCache[username] = (data as any).id;
          setProfileId((data as any).id);
        }
      } catch (err) {
        console.error("Error resolving username tag:", err);
      }
    };

    void resolveUsername();

    return () => {
      isMounted = false;
    };
  }, [username, profileId]);

  const href = profileId ? `/discover/${profileId}` : `/discover/username/${username}`;

  return (
    <Link
      href={href}
      className="text-brand-600 font-semibold hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      {tagText}
    </Link>
  );
}

interface MentionTextProps {
  text: string;
  className?: string;
  disableLinks?: boolean;
}

export function MentionText({ text, className, disableLinks = false }: MentionTextProps) {
  if (!text) return null;
  const parts = text.split(/(@[a-zA-Z0-9_]+)/g);

  return (
    <span className={className}>
      {parts.map((part, idx) => {
        if (part.startsWith("@")) {
          const username = part.slice(1);
          if (disableLinks) {
            return (
              <span key={idx} className="text-brand-600 font-semibold">
                {part}
              </span>
            );
          }
          return <MentionLink key={idx} username={username} tagText={part} />;
        }
        return part;
      })}
    </span>
  );
}
