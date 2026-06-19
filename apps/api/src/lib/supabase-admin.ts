import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, requireEnv } from "./env.js";

let client: SupabaseClient | null = null;

// Lazily created so the API boots without the service-role key — only staff creation needs it.
// Never expose the service-role key to the browser.
export function getSupabaseAdmin(): SupabaseClient {
  if (!client) {
    client = createClient(requireEnv("supabaseUrl"), requireEnv("supabaseServiceRoleKey"), {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  }
  return client;
}

export function hasSupabaseAdmin(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
}
