import { Hono } from "hono";
import { z } from "zod";
import { ApiError, ok } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import { verifySupabaseToken } from "../../lib/supabase.js";
import { validate } from "../../lib/validation.js";
import { requireAuth } from "../../middleware/auth.js";
import type { AppBindings } from "../../types.js";

export const authRoutes = new Hono<AppBindings>();

const setupAccountSchema = z.object({
  name: z.string().trim().min(1),
  schoolName: z.string().trim().min(1),
  phone: z.string().trim().optional()
});

authRoutes.get("/me", requireAuth, (c) => {
  return ok(c, c.get("user"));
});

authRoutes.patch("/me", requireAuth, (c) => {
  return ok(c, {
    message: "Profile update endpoint is scaffolded. Implementation belongs in the users module."
  });
});

authRoutes.post("/auth/setup-account", async (c) => {
  const authorization = c.req.header("Authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : null;

  if (!token) {
    throw new ApiError(401, "AUTHENTICATION_REQUIRED", "Missing bearer token");
  }

  const payload = await verifySupabaseToken(token);

  if (!payload.email) {
    throw new ApiError(400, "VALIDATION_ERROR", "Supabase account is missing an email address");
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      supabaseUserId: payload.sub
    }
  });

  if (existingUser) {
    return ok(c, existingUser);
  }

  const body = validate(setupAccountSchema, await c.req.json());

  const school = await prisma.school.create({
    data: {
      name: body.schoolName,
      users: {
        create: {
          supabaseUserId: payload.sub,
          name: body.name,
          email: payload.email,
          phone: body.phone,
          role: "PRINCIPAL",
          status: "ACTIVE"
        }
      }
    },
    include: {
      users: true
    }
  });

  return ok(c, school.users[0], 201);
});
