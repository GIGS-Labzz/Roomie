import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

// Singleton — @supabase/ssr deduplicates per URL+key but we keep the ref stable
let _client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (!_client) {
    _client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      // No auth overrides — @supabase/ssr manages cookie-based session storage automatically.
      // Overriding auth options here can break SSR cookie sync with the middleware.
    );
  }
  return _client;
}
