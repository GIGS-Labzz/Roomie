import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
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

    const { data: { user } } = await supabase.auth.getUser();
    const body = await request.json().catch(() => ({}));
    const { status, score = 0.85, vendor_ref } = body;

    const targetUserId = user?.id || body.user_id;

    if (!targetUserId) {
      return NextResponse.json({ error: "Missing user identification" }, { status: 400 });
    }

    const isPassed = status === "passed" || score >= 0.75;
    const now = new Date().toISOString();

    // Fetch user profile
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("nin_verified, user_type")
      .eq("id", targetUserId)
      .single();

    const ninVerified = profile?.nin_verified ?? false;
    const isIdentityVerified = isPassed && ninVerified;

    // Update profiles table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("profiles")
      .update({
        face_verified: isPassed,
        face_verified_at: isPassed ? now : null,
        face_vendor_ref: vendor_ref || `face_${Date.now()}`,
        face_match_score: score,
        identity_verified: isIdentityVerified,
        identity_verified_at: isIdentityVerified ? now : null,
        onboarding_step: 5,
      })
      .eq("id", targetUserId);

    // Record verification session update
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("verification_sessions").insert({
      user_id: targetUserId,
      session_type: "face_match",
      vendor: "dojah",
      vendor_ref: vendor_ref || `face_${Date.now()}`,
      status: isPassed ? "passed" : "failed",
      payload: { score, status },
    });

    return NextResponse.json({
      success: true,
      faceVerified: isPassed,
      identityVerified: isIdentityVerified,
    });
  } catch (err: unknown) {
    console.error("[Face Callback API Error]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
