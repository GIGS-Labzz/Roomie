import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { validateNINFormat, hashNIN, compareNames } from "@/lib/kyc";
import { dojahClient } from "@/lib/dojahClient";
import type { Database } from "@repo/db/types";

export async function POST(request: NextRequest) {
  try {
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { nin } = body;

    if (!nin || typeof nin !== "string" || !validateNINFormat(nin)) {
      return NextResponse.json({ error: "Invalid NIN format. Please enter an 11-digit number." }, { status: 400 });
    }

    const hashed = await hashNIN(nin);

    // Fetch user profile to get display_name
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();

    // Call Dojah NIN lookup (or mock fallback)
    const dojahRes = await dojahClient.lookupNIN(nin);

    if (!dojahRes.success || !dojahRes.data) {
      // Record failed session
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("verification_sessions").insert({
        user_id: user.id,
        session_type: "nin_lookup",
        vendor: "dojah",
        status: "failed",
        payload: { error: dojahRes.error || "NIN lookup failed" },
      });

      return NextResponse.json(
        { error: dojahRes.error || "NIN lookup failed. Please double check your 11-digit NIN." },
        { status: 400 }
      );
    }

    // Name match check
    const nameMatch = compareNames(
      profile?.display_name || "",
      dojahRes.data.first_name,
      dojahRes.data.last_name
    );

    // Record session
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("verification_sessions").insert({
      user_id: user.id,
      session_type: "nin_lookup",
      vendor: "dojah",
      vendor_ref: dojahRes.data.reference,
      status: nameMatch.match ? "passed" : "manual_review",
      payload: {
        score: nameMatch.score,
        matched: nameMatch.match,
        vendor_ref: dojahRes.data.reference,
      },
    });

    const now = new Date().toISOString();

    // Update profile with NIN verification status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from("profiles")
      .update({
        nin_hash: hashed,
        nin_verified: nameMatch.match,
        nin_verified_at: nameMatch.match ? now : null,
        nin_vendor_ref: dojahRes.data.reference,
        onboarding_step: 4,
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json({ error: "Database update error" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      nameMatch: nameMatch.match,
      matchScore: nameMatch.score,
      reference: dojahRes.data.reference,
    });
  } catch (err: unknown) {
    console.error("[NIN API Error]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
