import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Database } from "@repo/db/types";

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

  const { data: profileData } = await supabase
    .from("profiles")
    .select("onboarding_complete, onboarding_step")
    .eq("id", user.id)
    .single();

  const profile = profileData as { onboarding_complete: boolean | null; onboarding_step: number | null } | null;

  if (!profile?.onboarding_complete) {
    const stepRoutes: Record<number, string> = {
      0: "/onboarding/welcome",
      1: "/onboarding/basics",
      2: "/onboarding/university",
      3: "/onboarding/vibe",
      4: "/onboarding/budget",
      5: "/onboarding/verify",
    };
    redirect(stepRoutes[profile?.onboarding_step ?? 0] ?? "/onboarding/welcome");
  }

  redirect("/discover");
}
