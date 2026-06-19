export const env = {
  databaseUrl: process.env.DATABASE_URL,
  port: Number(process.env.PORT ?? 4000),
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  whatsappProvider: process.env.WHATSAPP_PROVIDER,
  whatsappApiKey: process.env.WHATSAPP_API_KEY,
  whatsappSenderId: process.env.WHATSAPP_SENDER_ID
};

export function requireEnv(name: keyof typeof env): string {
  const value = env[name];

  if (!value || typeof value !== "string") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
