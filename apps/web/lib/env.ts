export const webEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
};

export function hasSupabaseEnv() {
  return Boolean(webEnv.supabaseUrl && webEnv.supabaseAnonKey);
}
