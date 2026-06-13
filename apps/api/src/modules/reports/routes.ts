import { Hono } from "hono";
import { ok } from "../../lib/errors.js";
import { requireAuth } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/require-permission.js";
import type { AppBindings } from "../../types.js";

export const reportRoutes = new Hono<AppBindings>();

reportRoutes.get("/reports/attendance", requireAuth, requirePermission("VIEW_REPORTS"), (c) => {
  return ok(c, { items: [] });
});

reportRoutes.get("/reports/students", requireAuth, requirePermission("VIEW_REPORTS"), (c) => {
  return ok(c, { items: [] });
});
