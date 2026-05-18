// lib/supabase/server.ts
// Server-side Supabase client (service-role). Bypasses RLS — only use in
// server-only code paths (ingest script, route handlers, server components).
//
// An auth-aware cookie-bound client used to live here too (getServerSupabase),
// but nothing in the current build calls it. Re-add it from git history when
// we wire up business-owner login flows post-claim.

import { createClient } from "@supabase/supabase-js";

export function getServiceRoleSupabase() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}
