import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getOnboardingRoute } from "@/lib/onboardingRoute";
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

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/auth/signin`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileData } = await (supabase as any)
    .from("profiles")
    .select("onboarding_complete, onboarding_step, user_type")
    .eq("id", user.id)
    .single();

  const profile = profileData as {
    onboarding_complete: boolean | null;
    onboarding_step: number | null;
    user_type: string | null;
  } | null;

  if (!profile || !profile.onboarding_complete) {
    const step = profile?.onboarding_step ?? 0;
    const route = getOnboardingRoute(step, profile?.user_type);
    return NextResponse.redirect(`${origin}${route}`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
