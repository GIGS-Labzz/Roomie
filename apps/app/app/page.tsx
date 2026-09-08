import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getOnboardingRoute } from "@/lib/onboardingRoute";
import type { Database } from "@repo/db/types";

export { getOnboardingRoute };

export default async function RootPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

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

  if (!profile?.onboarding_complete) {
    const step = profile?.onboarding_step ?? 0;
    redirect(getOnboardingRoute(step, profile?.user_type));
  }

  redirect("/feed");
}
