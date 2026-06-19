import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { requireEnv } from "./env.js";

let client: SupabaseClient | null = null;

// User-facing GoTrue client (anon key). Used server-side so the browser hits OUR /auth/*
// endpoints instead of calling supabase.co directly — that's what lets us rate-limit logins.
// Sessions are never persisted here: each request issues its own short-lived sign-in.
export function getSupabaseAuthClient(): SupabaseClient {
  if (!client) {
    client = createClient(requireEnv("supabaseUrl"), requireEnv("supabaseAnonKey"), {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  }
  return client;
}
