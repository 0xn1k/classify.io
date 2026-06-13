import { Hono } from "hono";
import { ok } from "../../lib/errors.js";
import { requireAuth } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/require-permission.js";
import type { AppBindings } from "../../types.js";

export const userRoutes = new Hono<AppBindings>();

userRoutes.get("/users", requireAuth, requirePermission("MANAGE_USERS"), (c) => {
  return ok(c, { items: [] });
});

userRoutes.post("/users", requireAuth, requirePermission("MANAGE_USERS"), (c) => {
  return ok(c, { message: "User creation endpoint scaffolded" }, 201);
});
