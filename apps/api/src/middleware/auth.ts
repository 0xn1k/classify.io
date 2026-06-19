import { createMiddleware } from "hono/factory";
import { ApiError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { verifySupabaseToken } from "../lib/supabase.js";
import type { AppBindings, AppUser } from "../types.js";

export const requireAuth = createMiddleware<AppBindings>(async (c, next) => {
  const authorization = c.req.header("Authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : null;

  if (!token) {
    throw new ApiError(401, "AUTHENTICATION_REQUIRED", "Missing bearer token");
  }

  const payload = await verifySupabaseToken(token);
  const user = await prisma.user.findUnique({
    where: {
      supabaseUserId: payload.sub
    },
    include: { roles: true }
  });

  if (!user) {
    throw new ApiError(401, "AUTHENTICATION_REQUIRED", "Application user not found");
  }

  if (user.status !== "ACTIVE") {
    throw new ApiError(403, "FORBIDDEN", "User is inactive");
  }

  const userRoles = user.roles.map((assignment) => assignment.role);
  if (userRoles.length === 0) {
    throw new ApiError(403, "FORBIDDEN", "User has no roles assigned");
  }

  c.set("user", {
    id: user.id,
    schoolId: user.schoolId,
    supabaseUserId: payload.sub,
    name: user.name,
    email: user.email,
    phone: user.phone,
    roles: userRoles,
    status: user.status
  } satisfies AppUser);

  await next();
});
