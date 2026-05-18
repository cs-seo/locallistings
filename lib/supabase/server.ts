// lib/supabase/server.ts
// Server-side Supabase clients. Two flavors:
//   - `getServerSupabase()`: anon client, reads RLS-protected data on behalf of a user.
//   - `getServiceRoleSupabase()`: bypasses RLS — only use in server-only code paths (ingest, route handlers).

import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Anon client tied to the request's cookies. Use in Server Components and route handlers. */
export function getServerSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component — ignore. Middleware will handle session refresh.
          }
        },
        remove: (name, options) => {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // see above
          }
        },
      },
    },
  );
}

/** Service-role client. NEVER expose to the client bundle. */
export function getServiceRoleSupabase() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}
