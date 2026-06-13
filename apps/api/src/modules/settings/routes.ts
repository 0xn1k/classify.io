import { Hono } from "hono";
import { ok } from "../../lib/errors.js";
import { requireAuth } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/require-permission.js";
import type { AppBindings } from "../../types.js";

export const settingRoutes = new Hono<AppBindings>();

settingRoutes.get("/settings/school", requireAuth, requirePermission("MANAGE_SETTINGS"), (c) => {
  return ok(c, { item: null });
});

settingRoutes.patch("/settings/school", requireAuth, requirePermission("MANAGE_SETTINGS"), (c) => {
  return ok(c, { message: "School settings update endpoint scaffolded" });
});
