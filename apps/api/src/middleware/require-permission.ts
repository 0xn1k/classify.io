import { createMiddleware } from "hono/factory";
import { ApiError } from "../lib/errors.js";
import { hasAnyPermission, type Permission } from "../lib/rbac.js";
import type { AppBindings } from "../types.js";

export function requirePermission(permission: Permission) {
  return createMiddleware<AppBindings>(async (c, next) => {
    const user = c.get("user");

    if (!hasAnyPermission(user.roles, permission)) {
      throw new ApiError(403, "FORBIDDEN", `Missing permission: ${permission}`);
    }

    await next();
  });
}
