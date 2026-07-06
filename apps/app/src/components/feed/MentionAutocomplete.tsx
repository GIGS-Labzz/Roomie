"use client";

import { useState, useEffect } from "react";
import { createClient } from "@repo/db/client";
import { getActiveConnections } from "@repo/db/queries/connections";
import { Avatar } from "@repo/ui/avatar";

interface Profile {
  id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
}

interface MentionAutocompleteProps {
  userId: string;
  query: string;
  onSelect: (username: string) => void;
}

export function MentionAutocomplete({ userId, query, onSelect }: MentionAutocompleteProps) {
  const [connections, setConnections] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const loadConnections = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await getActiveConnections(supabase as any, userId);
        if (!error && data && isMounted) {
          const profiles = data.map((c: any) =>
            c.requester.id === userId ? c.receiver : c.requester
          ) as Profile[];
          // Filter out null profiles first, then filter out profiles without a username
          const validProfiles = profiles
            .filter((p): p is Profile => p !== null && p !== undefined)
            .filter((p) => !!p.username);
          setConnections(validProfiles);
        }
      } catch (err) {
        console.error("Failed to load connections for mention autocomplete:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadConnections();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Filter connections by query
  const filtered = connections.filter((p) => {
    if (!query) return true;
    const nameMatch = p.display_name.toLowerCase().includes(query.toLowerCase());
    const usernameMatch = p.username?.toLowerCase().includes(query.toLowerCase());
    return nameMatch || usernameMatch;
  });

  // Handle keyboard navigation in capturing phase to intercept before input default behaviors
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (filtered.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        setActiveIndex((prev) => (prev + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        e.stopPropagation();
        const selected = filtered[activeIndex];
        if (selected && selected.username) {
          onSelect(selected.username);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown, true);
    };
  }, [filtered, activeIndex, onSelect]);

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (loading && connections.length === 0) {
    return (
      <div className="absolute z-[99] left-0 right-0 mt-1 bg-white/90 backdrop-blur-md border border-slate-100 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-4 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (filtered.length === 0) return null;

  return (
    <div className="absolute z-[99] left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white/95 backdrop-blur-md border border-slate-100 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-1.5 flex flex-col gap-0.5 animate-slide-up">
      {filtered.map((profile, idx) => (
        <button
          key={profile.id}
          type="button"
          onClick={() => profile.username && onSelect(profile.username)}
          onMouseEnter={() => setActiveIndex(idx)}
          className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl transition-all duration-150 ${
            idx === activeIndex
              ? "bg-brand-500/10 text-brand-700"
              : "hover:bg-slate-50 text-slate-700"
          }`}
        >
          <Avatar src={profile.avatar_url} name={profile.display_name} size="xs" />
          <div className="flex-1 min-w-0 flex flex-col">
            <span className="font-semibold text-xs leading-none text-slate-800">
              {profile.display_name}
            </span>
            <span className="text-[10px] text-slate-400">@{profile.username}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
