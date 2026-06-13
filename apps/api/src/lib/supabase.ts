import { jwtVerify } from "jose";
import { requireEnv } from "./env.js";

export type SupabaseJwtPayload = {
  sub: string;
  email?: string;
  role?: string;
};

export async function verifySupabaseToken(token: string): Promise<SupabaseJwtPayload> {
  const secret = new TextEncoder().encode(requireEnv("supabaseJwtSecret"));
  const { payload } = await jwtVerify(token, secret);

  if (!payload.sub) {
    throw new Error("Supabase token is missing subject");
  }

  return {
    sub: payload.sub,
    email: typeof payload.email === "string" ? payload.email : undefined,
    role: typeof payload.role === "string" ? payload.role : undefined
  };
}
