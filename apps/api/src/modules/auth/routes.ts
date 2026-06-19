import { Prisma } from "@prisma/client";
import { Hono } from "hono";
import type { Context } from "hono";
import { z } from "zod";
import { ApiError, ok } from "../../lib/errors.js";
import { normalizePhone } from "../../lib/phone.js";
import { prisma } from "../../lib/prisma.js";
import { permissionsForRoles } from "../../lib/rbac.js";
import { getSupabaseAdmin, hasSupabaseAdmin } from "../../lib/supabase-admin.js";
import { getSupabaseAuthClient } from "../../lib/supabase-auth.js";
import { verifySupabaseToken } from "../../lib/supabase.js";
import { validate } from "../../lib/validation.js";
import { requireAuth } from "../../middleware/auth.js";
import { rateLimit } from "../../middleware/rate-limit.js";
import type { AppBindings } from "../../types.js";

export const authRoutes = new Hono<AppBindings>();

const setupAccountSchema = z.object({
  name: z.string().trim().min(1),
  schoolName: z.string().trim().min(1),
  password: z.string().min(6)
});

const loginSchema = z.object({
  phone: z.string().trim().min(8),
  password: z.string().min(1)
});

const startSignupSchema = z.object({
  phone: z.string().trim().min(8)
});

const verifyOtpSchema = z.object({
  phone: z.string().trim().min(8),
  token: z.string().trim().min(4)
});

// Brute-force guards. Login/verify are per-IP attempt caps; OTP send is stricter because
// every request costs an SMS. Tune the numbers to taste.
const loginLimiter = rateLimit({ name: "login", windowMs: 5 * 60_000, max: 10 });
const otpSendLimiter = rateLimit({ name: "otp-send", windowMs: 10 * 60_000, max: 5 });
const otpVerifyLimiter = rateLimit({ name: "otp-verify", windowMs: 5 * 60_000, max: 10 });

function bearerToken(c: Context<AppBindings>): string {
  const authorization = c.req.header("Authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : null;

  if (!token) {
    throw new ApiError(401, "AUTHENTICATION_REQUIRED", "Missing bearer token");
  }

  return token;
}

// Resolve a Supabase identity (its `sub`) to an app user, or flag that onboarding is needed.
async function resolveSession(supabaseUserId: string) {
  const existing = await prisma.user.findUnique({
    where: { supabaseUserId },
    include: { roles: true }
  });
  if (!existing) {
    return { user: null, needsOnboarding: true };
  }

  if (existing.status !== "ACTIVE") {
    throw new ApiError(403, "FORBIDDEN", "Your account is inactive. Contact your administrator.");
  }

  const { roles, ...rest } = existing;
  return { user: { ...rest, roles: roles.map((assignment) => assignment.role) }, needsOnboarding: false };
}

authRoutes.get("/me", requireAuth, (c) => {
  const user = c.get("user");
  return ok(c, { ...user, permissions: permissionsForRoles(user.roles) });
});

// Password sign-in, proxied server-side so the browser never calls supabase.co directly and
// every attempt passes through the rate limiter above.
authRoutes.post("/auth/login", loginLimiter, async (c) => {
  const body = validate(loginSchema, await c.req.json());
  const phone = normalizePhone(body.phone);

  const { data, error } = await getSupabaseAuthClient().auth.signInWithPassword({
    phone,
    password: body.password
  });

  if (error || !data.session || !data.user) {
    throw new ApiError(401, "AUTHENTICATION_REQUIRED", "Incorrect mobile number or password.");
  }

  const session = await resolveSession(data.user.id);

  return ok(c, {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    ...session
  });
});

// Step 1 of signup: send the phone OTP. Heavily rate-limited because each call sends an SMS.
authRoutes.post("/auth/signup/start", otpSendLimiter, async (c) => {
  const body = validate(startSignupSchema, await c.req.json());
  const phone = normalizePhone(body.phone);

  const { error } = await getSupabaseAuthClient().auth.signInWithOtp({
    phone,
    options: { shouldCreateUser: true }
  });

  if (error) {
    throw new ApiError(400, "VALIDATION_ERROR", "We couldn't send the code. Check the number and try again.");
  }

  return ok(c, { sent: true });
});

// Step 2 of signup: verify the OTP and return a session. New numbers come back as
// needsOnboarding so the client can collect institute details next.
authRoutes.post("/auth/signup/verify", otpVerifyLimiter, async (c) => {
  const body = validate(verifyOtpSchema, await c.req.json());
  const phone = normalizePhone(body.phone);

  const { data, error } = await getSupabaseAuthClient().auth.verifyOtp({
    phone,
    token: body.token,
    type: "sms"
  });

  if (error || !data.session || !data.user) {
    throw new ApiError(401, "AUTHENTICATION_REQUIRED", "That code didn't work. Please try again.");
  }

  const session = await resolveSession(data.user.id);

  return ok(c, {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    ...session
  });
});

// Called right after login/verification. Resolves the Supabase identity to an app user,
// or signals that institute onboarding is needed (brand-new principal).
authRoutes.post("/auth/session", async (c) => {
  const payload = await verifySupabaseToken(bearerToken(c));
  return ok(c, await resolveSession(payload.sub));
});

// First-time institute registration: the signed-in phone becomes the school's PRINCIPAL.
// We also set the chosen password server-side (Admin API) so the browser never has to.
authRoutes.post("/auth/setup-account", async (c) => {
  const payload = await verifySupabaseToken(bearerToken(c));

  const existing = await prisma.user.findUnique({ where: { supabaseUserId: payload.sub } });
  if (existing) {
    return ok(c, existing);
  }

  if (!payload.phone) {
    throw new ApiError(400, "VALIDATION_ERROR", "Your login is missing a phone number.");
  }

  const body = validate(setupAccountSchema, await c.req.json());

  if (!hasSupabaseAdmin()) {
    throw new ApiError(
      500,
      "INTERNAL_ERROR",
      "Account setup is not configured. Set SUPABASE_SERVICE_ROLE_KEY on the API."
    );
  }

  const passwordUpdate = await getSupabaseAdmin().auth.admin.updateUserById(payload.sub, {
    password: body.password
  });
  if (passwordUpdate.error) {
    throw new ApiError(400, "VALIDATION_ERROR", "We couldn't set your password. Please try again.");
  }

  try {
    const school = await prisma.school.create({
      data: {
        name: body.schoolName,
        users: {
          create: {
            supabaseUserId: payload.sub,
            name: body.name,
            email: payload.email,
            phone: payload.phone,
            status: "ACTIVE",
            roles: { create: { role: "PRINCIPAL" } }
          }
        }
      },
      include: { users: true }
    });

    return ok(c, school.users[0], 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ApiError(409, "CONFLICT", "An account already exists for this phone number.");
    }
    throw error;
  }
});
