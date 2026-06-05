"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@repo/db/client";

const supabase = createClient();

export type AdminRole = "super_admin" | "provider" | "pending" | null;

interface AdminAuthContextType {
  user: User | null;
  role: AdminRole;
  platformId: string | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AdminRole>(null);
  const [platformId, setPlatformId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const resolveRole = async (u: User | null) => {
    if (!u) { setRole(null); setPlatformId(null); setIsLoading(false); return; }

    // Check super admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: adminRow } = await (supabase as any)
      .from("admin_users")
      .select("role")
      .eq("id", u.id)
      .maybeSingle();

    if (adminRow) { setRole("super_admin"); setPlatformId(null); setIsLoading(false); return; }

    // Check housing provider (match by contact_email)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: platform } = await (supabase as any)
      .from("housing_platforms")
      .select("id, status")
      .eq("contact_email", u.email)
      .maybeSingle();

    if (platform) {
      setRole(platform.status === "ACTIVE" ? "provider" : "pending");
      setPlatformId(platform.id as string);
    } else {
      setRole("pending");
      setPlatformId(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      void resolveRole(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => { await supabase.auth.signOut(); };

  const value = useMemo(
    () => ({ user, role, platformId, isLoading, logout }),
    [user, role, platformId, isLoading]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside <AdminAuthProvider>");
  return ctx;
}
