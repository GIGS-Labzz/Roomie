import { NextRequest, NextResponse } from "next/server";
import { withAuth, isAuthError } from "@/lib/auth-guard";
import { createServiceClient } from "@repo/db/server";
import { getConnectionMap } from "@repo/db/queries/connections";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const auth = await withAuth();
  if (isAuthError(auth)) return auth.error;
  const { user } = auth;

  const { userId } = await params;

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(userId)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  try {
    const db = await createServiceClient();
    const networkMap = await getConnectionMap(db as any, userId, user.id);
    return NextResponse.json(networkMap);
  } catch (error: any) {
    console.error("Failed to fetch connection map:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
