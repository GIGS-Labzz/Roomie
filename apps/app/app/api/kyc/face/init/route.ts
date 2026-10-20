import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { dojahClient } from "@/lib/dojahClient";
import type { Database } from "@repo/db/types";

export async function POST() {
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

    const sessionRes = await dojahClient.initFaceLivenessSession(user.id);

    if (!sessionRes.success) {
      return NextResponse.json({ error: sessionRes.error || "Liveness session init failed" }, { status: 400 });
    }

    // Record verification session entry
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("verification_sessions").insert({
      user_id: user.id,
      session_type: "liveness",
      vendor: "dojah",
      vendor_ref: sessionRes.sessionId,
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      sessionId: sessionRes.sessionId,
      url: sessionRes.url,
    });
  } catch (err: unknown) {
    console.error("[Face Init API Error]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
