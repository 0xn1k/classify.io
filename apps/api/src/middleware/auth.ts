import { createMiddleware } from "hono/factory";
import { ApiError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { roles } from "../lib/rbac.js";
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
    }
  });

  if (!user) {
    throw new ApiError(401, "AUTHENTICATION_REQUIRED", "Application user not found");
  }

  if (user.status !== "ACTIVE") {
    throw new ApiError(403, "FORBIDDEN", "User is inactive");
  }

  if (!roles.some((role) => role === user.role)) {
    throw new ApiError(403, "FORBIDDEN", "User role is not supported");
  }

  c.set("user", {
    id: user.id,
    schoolId: user.schoolId,
    supabaseUserId: user.supabaseUserId,
    name: user.name,
    email: user.email,
    role: user.role as AppUser["role"],
    status: user.status
  } satisfies AppUser);

  await next();
});
