"use client";

import Link from "next/link";

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
  const href = `/discover/${encodeURIComponent(username)}`;

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
