import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { readSupabaseEnv } from "@/lib/db/migration-rules";

let cached: SupabaseClient | null = null;

/**
 * Server-only Supabase client using the service role.
 * Do not import this module from Client Components.
 * Auth session is disabled so the key is not treated as a user JWT.
 * @see https://supabase.com/docs/reference/javascript/initializing
 */
export function getServiceClient(): SupabaseClient {
  if (cached) return cached;
  const env = readSupabaseEnv({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
  cached = createClient(env.url, env.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        fetch(input, { ...init, cache: "no-store" }),
    },
  });
  return cached;
}
