import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient, createServiceClient } from "@repo/db/server";
import { type HousingPlatform } from "@repo/db/queries/housing";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { PlatformCard } from "@/components/housing/PlatformCard";
import { CongratsModal } from "@/components/connect/CongratsModal";
import { Avatar } from "@repo/ui/avatar";

type SearchParams = Promise<{ connectionId?: string; celebrate?: string }>;

export default async function HousingPage({ searchParams }: { searchParams: SearchParams }) {
  const { connectionId, celebrate } = await searchParams;

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  const db = await createServiceClient();

  // Fetch user's own profile to retrieve username and location/campus details
  const { data: myProfile } = await (db as any)
    .from("profiles")
    .select("username, city, university")
    .eq("id", user.id)
    .single();

  // Fetch all active connections of the user
  const { data: connections } = await (db as any)
    .from("connections")
    .select(`
      id, requester_id, receiver_id, status, connected_at,
      requester:profiles!requester_id(id, display_name, username, avatar_url, city, university),
      receiver:profiles!receiver_id(id, display_name, username, avatar_url, city, university)
    `)
    .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .eq("status", "ACTIVE")
    .order("connected_at", { ascending: false });

  const activeConnections = connections ?? [];
  const connectionIds = activeConnections.map((c: any) => c.id);

  // Fetch all roommate agreements directly confirmed for these connections
  const { data: userConfirmed } = connectionIds.length > 0
    ? await (db as any)
        .from("roommate_agreements")
        .select("id, connection_id, status, roomie_id")
        .in("connection_id", connectionIds)
        .eq("status", "CONFIRMED")
    : { data: [] };

  const userAgreements = userConfirmed ?? [];
  const userRoomieIds = Array.from(new Set(userAgreements.map((a: any) => a.roomie_id).filter(Boolean)));

  // Fetch all confirmed agreements in the database that share these roomie_ids
  const { data: poolConfirmed } = userRoomieIds.length > 0
    ? await (db as any)
        .from("roommate_agreements")
        .select("id, connection_id, status, roomie_id")
        .in("roomie_id", userRoomieIds)
        .eq("status", "CONFIRMED")
    : { data: [] };

  const agreements = poolConfirmed ?? [];

  // Extract all connection IDs from the pool confirmed agreements
  const poolConnectionIds = Array.from(new Set(agreements.map((a: any) => a.connection_id)));

  // Fetch all connections for these agreements to resolve profiles of all pool members
  const { data: poolConnections } = poolConnectionIds.length > 0
    ? await (db as any)
        .from("connections")
        .select(`
          id, requester_id, receiver_id, status, connected_at,
          requester:profiles!requester_id(id, display_name, username, avatar_url, city, university),
          receiver:profiles!receiver_id(id, display_name, username, avatar_url, city, university)
        `)
        .in("id", poolConnectionIds)
    : { data: [] };

  const allActiveConnections = poolConnections ?? [];
  const confirmedConnectionIds = agreements.map((a: any) => a.connection_id);

  // Group agreements by roomie_id to support roommate pools
  const poolGroupsMap: Record<string, {
    roomieId: string;
    agreements: any[];
    roommates: any[];
    primaryConnectionId: string;
  }> = {};

  for (const agreement of agreements) {
    const rId = agreement.roomie_id;
    if (!rId) continue;
    const conn = allActiveConnections.find((c: any) => c.id === agreement.connection_id);
    if (!conn) continue;

    if (!poolGroupsMap[rId]) {
      poolGroupsMap[rId] = {
        roomieId: rId,
        agreements: [],
        roommates: [],
        primaryConnectionId: agreement.connection_id
      };
    }
    poolGroupsMap[rId].agreements.push(agreement);
    
    // Add unique roommates (not current user)
    if (conn.requester && conn.requester.id !== user.id) {
      if (!poolGroupsMap[rId].roommates.some(r => r.id === conn.requester.id)) {
        poolGroupsMap[rId].roommates.push(conn.requester);
      }
    }
    if (conn.receiver && conn.receiver.id !== user.id) {
      if (!poolGroupsMap[rId].roommates.some(r => r.id === conn.receiver.id)) {
        poolGroupsMap[rId].roommates.push(conn.receiver);
      }
    }
  }

  const poolGroups = Object.values(poolGroupsMap);

  // Show locked state if there are no connections at all
  if (activeConnections.length === 0) {
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
          <LockedState
            title="Connect with a roommate first"
            body="Housing providers unlock after you connect and confirm a roommate agreement in chat."
            href="/discover"
            action="Browse roommates"
          />
        </main>
      </div>
    );
  }

  // Show agreement needed state if there are active connections but none are confirmed
  if (agreements.length === 0) {
    const firstActiveConn = activeConnections[0];
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
          <LockedState
            title="Agreement needed"
            body="Propose an agreement from your chat. When the other person accepts and pays, housing providers unlock for both of you."
            href={`/chat/${firstActiveConn.id}`}
            action="Open chat"
          />
        </main>
      </div>
    );
  }

  const isSelectedValid = connectionId && confirmedConnectionIds.includes(connectionId);

  // If a valid connection is selected, fetch platforms and display them
  if (isSelectedValid) {
    const selectedAgreement = agreements.find((a: any) => a.connection_id === connectionId);
    const selectedConnection = allActiveConnections.find((c: any) => c.id === connectionId);
    if (!selectedConnection) redirect("/housing");
    const roommate = selectedConnection.requester_id === user.id ? selectedConnection.receiver : selectedConnection.requester;

    // Fetch all roommates in this pool
    const poolAgreements = selectedAgreement?.roomie_id
      ? agreements.filter((a: any) => a.roomie_id === selectedAgreement.roomie_id)
      : [];

    const roommatesMap = new Map<string, any>();
    for (const pa of poolAgreements) {
      const conn = allActiveConnections.find((c: any) => c.id === pa.connection_id);
      if (conn) {
        if (conn.requester && conn.requester.id !== user.id) {
          roommatesMap.set(conn.requester.id, conn.requester);
        }
        if (conn.receiver && conn.receiver.id !== user.id) {
          roommatesMap.set(conn.receiver.id, conn.receiver);
        }
      }
    }
    const poolRoommates = Array.from(roommatesMap.values());

    const { data: allPlatforms } = await (supabase as any)
      .from("housing_platforms")
      .select("*")
      .eq("status", "ACTIVE")
      .order("is_featured", { ascending: false })
      .order("total_referrals", { ascending: false });

    const platforms = (allPlatforms ?? []) as HousingPlatform[];

    const city = myProfile?.city?.trim().toLowerCase();
    const university = myProfile?.university?.trim().toLowerCase();

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

          {/* Active Connection sub-header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-50 border border-brand-200/60 rounded-2xl p-4 mb-6 shadow-sm">
            <div className="flex items-center gap-3">
              {poolRoommates.length > 1 ? (
                <div className="flex -space-x-2">
                  {poolRoommates.slice(0, 3).map((r: any) => (
                    <Avatar key={r.id} src={r.avatar_url} name={r.display_name} size="sm" className="ring-2 ring-white" />
                  ))}
                </div>
              ) : (
                <Avatar src={roommate.avatar_url} name={roommate.display_name} size="sm" className="ring-2 ring-brand-100" />
              )}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-700">
                  {poolRoommates.length > 1 ? "Roommate Pool" : "Roommate Connection"}
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {poolRoommates.length > 1
                    ? `Browsing housing with pool: ${poolRoommates.map((r: any) => r.display_name.split(" ")[0]).join(" & ")}`
                    : `Browsing housing with ${roommate.display_name}`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/housing"
                className="hidden md:inline-flex items-center justify-center rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
              >
                Change roommate
              </Link>
              <Link
                href={`/chat/${connectionId}`}
                className="inline-flex items-center justify-center rounded-xl bg-brand-500 hover:bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors shadow-sm"
              >
                Back to Chat
              </Link>
            </div>
          </div>

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
                      connectionId={connectionId}
                      roomieId={selectedAgreement?.roomie_id}
                      roommateUsername={roommate.username}
                      agreementId={selectedAgreement?.id}
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
                      connectionId={connectionId}
                      roomieId={selectedAgreement?.roomie_id}
                      roommateUsername={roommate.username}
                      agreementId={selectedAgreement?.id}
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
        </main>

        {celebrate === "1" && (
          <CongratsModal
            agreementId={selectedAgreement?.id}
            roomieId={selectedAgreement?.roomie_id}
            roommateName={roommate.display_name}
          />
        )}
      </div>
    );
  }

  // If no connection is selected (or provided query is invalid) and roommate agreements exist
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

        {/* Responsive layout: Desktop Selection screen */}
        <div className="hidden md:block space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Select a Roommate Agreement</h2>
            <p className="text-sm text-slate-500 mb-6">
              You have confirmed roommate agreements. Please select the connection you would like to use to browse housing.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {poolGroups.map((group) => {
                const isPool = group.roommates.length > 1;
                const displayName = isPool
                  ? `Pool: ${group.roommates.map(r => r.display_name.split(" ")[0]).join(" & ")}`
                  : group.roommates[0].display_name;
                
                const subtitle = isPool
                  ? `Roomie Pool (${group.roommates.length + 1} members)`
                  : group.roommates[0].university ?? group.roommates[0].city ?? "Roomie Partner";

                const avatarUrl = isPool ? null : group.roommates[0].avatar_url;

                return (
                  <div key={group.roomieId} className="border border-slate-100 rounded-2xl p-4 flex flex-col items-center text-center bg-slate-50/50 hover:bg-slate-50 transition-colors shadow-sm">
                    {isPool ? (
                      <div className="flex -space-x-2.5 mb-3">
                        {group.roommates.slice(0, 3).map((r: any) => (
                          <Avatar key={r.id} src={r.avatar_url} name={r.display_name} size="md" className="ring-2 ring-white shadow-sm" />
                        ))}
                      </div>
                    ) : (
                      <Avatar src={avatarUrl} name={displayName} size="md" className="mb-3 ring-2 ring-white shadow-sm" />
                    )}
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{displayName}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{subtitle}</p>
                    <Link
                      href={`/housing?connectionId=${group.primaryConnectionId}`}
                      className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-brand-500 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-brand-600 shadow-sm"
                    >
                      Browse Housing
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Responsive layout: Mobile Access Warning screen */}
        <div className="block md:hidden">
          <section className="rounded-3xl border border-dashed border-sage-light bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sage-surface text-brand-600 shadow-sm">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2h-1V7a5 5 0 00-10 0v4H6a2 2 0 00-2 2v6a2 2 0 002 2zm3-10V7a3 3 0 016 0v4" />
              </svg>
            </div>
            <h2 className="mt-6 text-xl font-bold text-slate-900">Access Housing via Chat</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
              On mobile, housing features are locked within your verified roommate chats.
              Please go to your chat list and open a thread with a confirmed agreement to browse housing.
            </p>
            <Link
              href="/chat"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 shadow-sm"
            >
              Go to Chats
            </Link>
          </section>
        </div>
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
        className="mt-5 inline-flex items-center justify-center rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 shadow-sm"
      >
        {action}
      </Link>
    </section>
  );
}
