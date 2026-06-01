import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { Database } from "@repo/db/types";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/discover";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/signin?error=missing_code`);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: Record<string, unknown>) => cookieStore.set({ name, value, ...options }),
        remove: (name: string, options: Record<string, unknown>) => cookieStore.set({ name, value: "", ...options }),
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("OAuth callback error:", error.message);
    return NextResponse.redirect(`${origin}/auth/signin?error=oauth_failed`);
  }

  // Profile is auto-created by DB trigger on_auth_user_created
  // Check onboarding state — redirect to appropriate step
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/auth/signin`);
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("onboarding_complete, onboarding_step")
    .eq("id", user.id)
    .single();

  const profile = profileData as { onboarding_complete: boolean | null; onboarding_step: number | null } | null;

  if (!profile || !profile.onboarding_complete) {
    const step = profile?.onboarding_step ?? 0;
    const stepRoutes: Record<number, string> = {
      0: "/onboarding/welcome",
      1: "/onboarding/basics",
      2: "/onboarding/university",
      3: "/onboarding/vibe",
      4: "/onboarding/budget",
      5: "/onboarding/verify",
    };
    return NextResponse.redirect(`${origin}${stepRoutes[step] ?? "/onboarding/welcome"}`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
