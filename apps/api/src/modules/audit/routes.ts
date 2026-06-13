import { Hono } from "hono";
import { ok } from "../../lib/errors.js";
import { requireAuth } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/require-permission.js";
import type { AppBindings } from "../../types.js";

export const auditRoutes = new Hono<AppBindings>();

auditRoutes.get("/audit-logs", requireAuth, requirePermission("VIEW_AUDIT_LOGS"), (c) => {
  return ok(c, { items: [] });
});
