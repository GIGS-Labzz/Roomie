import { createServerClient } from "@repo/db/server";
import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

interface AuthResult {
  user: User;
  supabase: Awaited<ReturnType<typeof createServerClient>>;
}

interface AuthError {
  error: NextResponse;
}

export async function withAuth(): Promise<AuthResult | AuthError> {
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { user, supabase };
}

export function isAuthError(result: AuthResult | AuthError): result is AuthError {
  return "error" in result;
}
