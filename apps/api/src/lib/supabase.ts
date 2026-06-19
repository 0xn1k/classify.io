import { createRemoteJWKSet, jwtVerify } from "jose";
import { requireEnv } from "./env.js";

export type SupabaseJwtPayload = {
  sub: string;
  phone?: string;
  email?: string;
};

// Supabase signs access tokens with asymmetric (ES256) keys; verify against the project JWKS.
const jwks = createRemoteJWKSet(new URL(`${requireEnv("supabaseUrl")}/auth/v1/.well-known/jwks.json`));

export async function verifySupabaseToken(token: string): Promise<SupabaseJwtPayload> {
  const { payload } = await jwtVerify(token, jwks);

  if (!payload.sub) {
    throw new Error("Supabase token is missing subject");
  }

  return {
    sub: payload.sub,
    phone: typeof payload.phone === "string" ? payload.phone : undefined,
    email: typeof payload.email === "string" ? payload.email : undefined
  };
}
