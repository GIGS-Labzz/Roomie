import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@repo/db/server";
import { getRelevantPlatforms, type HousingPlatform } from "@repo/db/queries/housing";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { PlatformCard } from "@/components/housing/PlatformCard";

export default async function HousingPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: connections } = await (supabase as any)
    .from("connections")
    .select(`
      id, requester_id, receiver_id, status, connected_at,
      requester:profiles!requester_id(id, display_name, city, university),
      receiver:profiles!receiver_id(id, display_name, city, university)
    `)
    .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .eq("status", "ACTIVE")
    .order("connected_at", { ascending: false });

  const connectionIds = (connections ?? []).map((c: { id: string }) => c.id);

  // Check ALL active connections for any confirmed agreement — not just the first one.
  // Both the initiator and acceptor share the same connection, so both should see it.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: confirmedAgreement } = connectionIds.length > 0
    ? await (supabase as any)
        .from("roommate_agreements")
        .select("id, connection_id, status")
        .in("connection_id", connectionIds)
        .eq("status", "CONFIRMED")
        .limit(1)
        .maybeSingle()
    : { data: null };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("city, university")
    .eq("id", user.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: allPlatforms } = confirmedAgreement
    ? await (supabase as any)
        .from("housing_platforms")
        .select("*")
        .eq("status", "ACTIVE")
        .order("is_featured", { ascending: false })
        .order("total_referrals", { ascending: false })
    : { data: [] };

  const platforms = (allPlatforms ?? []) as HousingPlatform[];

  const city = profile?.city?.trim().toLowerCase();
  const university = profile?.university?.trim().toLowerCase();

  const matchedPlatforms = platforms.filter((platform) => {
    const cityMatch = city
      ? platform.cities.some((item) => item.toLowerCase() === city)
      : false;
    const campusMatch = university
      ? (platform.campus_tags ?? []).some((item) => university.includes(item.toLowerCase()))
      : false;

    return cityMatch || campusMatch;
  });

  const otherPlatforms = platforms.filter((platform) => !matchedPlatforms.includes(platform));

  const activeConnection = connections?.[0];

  return (
    <div className="min-h-screen bg-sage-surface md:flex">
      <AppSidebar />

      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 md:px-8 md:pb-10">
        <header className="mb-5">
          <p className="text-sm font-semibold text-brand-600">Housing providers</p>
          <h1 className="font-display text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
            Find your place together
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            Curated student housing options near your city and campus.
          </p>
        </header>

        {!activeConnection ? (
          <LockedState
            title="Connect with a roommate first"
            body="Housing providers unlock after you connect and confirm a roommate agreement in chat."
            href="/discover"
            action="Browse roommates"
          />
        ) : !confirmedAgreement ? (
          <LockedState
            title="Agreement needed"
            body="Propose an agreement from your chat. When the other person accepts and pays, housing providers unlock for both of you."
            href={`/chat/${activeConnection.id}`}
            action="Open chat"
          />
        ) : (
          <div className="space-y-8">
            {/* Matched Platforms Section */}
            {matchedPlatforms.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
                  Curated for your campus & location
                </h2>
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {matchedPlatforms.map((platform: HousingPlatform) => (
                    <PlatformCard
                      key={platform.id}
                      platform={platform}
                      connectionId={confirmedAgreement.connection_id}
                    />
                  ))}
                </section>
              </div>
            )}

            {/* Other Verified Platforms Section */}
            {otherPlatforms.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800 pt-2">
                  {matchedPlatforms.length > 0 ? "Other verified housing" : "Verified housing providers"}
                </h2>
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {otherPlatforms.map((platform: HousingPlatform) => (
                    <PlatformCard
                      key={platform.id}
                      platform={platform}
                      connectionId={confirmedAgreement.connection_id}
                    />
                  ))}
                </section>
              </div>
            )}

            {platforms.length === 0 && (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 text-slate-400 text-sm">
                No housing platforms registered yet.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function LockedState({
  title,
  body,
  href,
  action,
}: {
  title: string;
  body: string;
  href: string;
  action: string;
}) {
  return (
    <section className="rounded-2xl border border-dashed border-sage-light bg-white p-6 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-surface text-brand-600">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2h-1V7a5 5 0 00-10 0v4H6a2 2 0 00-2 2v6a2 2 0 002 2zm3-10V7a3 3 0 016 0v4" />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-bold text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">{body}</p>
      <Link
        href={href}
        className="mt-5 inline-flex items-center justify-center rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
      >
        {action}
      </Link>
    </section>
  );
}
