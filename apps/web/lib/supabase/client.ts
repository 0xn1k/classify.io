import { createBrowserClient } from "@supabase/ssr";
import { webEnv } from "@/lib/env";

export function createSupabaseBrowserClient() {
  return createBrowserClient(webEnv.supabaseUrl, webEnv.supabaseAnonKey);
}
