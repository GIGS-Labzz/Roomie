import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

// Routes accessible without authentication
const PUBLIC_ROUTES = [
  "/auth/signin",
  "/auth/callback",
  "/offline",
  "/discover",     // browse feed without account (mock data visible during dev)
  "/terms",
  "/privacy",
];

// Routes that strictly require auth (redirect to signin if not authed)
const PROTECTED_ROUTES = [
  "/onboarding",
  "/connect",
  "/chat",
  "/splits",
  "/housing",
  "/profile",
  "/notifications",
  "/feed",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public routes through
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => request.cookies.get(name)?.value,
        set: (name: string, value: string, options: Record<string, unknown>) => {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options: Record<string, unknown>) => {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Refresh session cookie on every request so it never silently expires
  const { data: { user } } = await supabase.auth.getUser();

  // Protect explicit routes
  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r)) && !user) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
