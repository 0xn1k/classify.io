import { Hono } from "hono";
import { ok } from "../../lib/errors.js";
import { requireAuth } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/require-permission.js";
import type { AppBindings } from "../../types.js";

export const communicationRoutes = new Hono<AppBindings>();

communicationRoutes.get("/notifications", requireAuth, requirePermission("SEND_NOTIFICATIONS"), (c) => {
  return ok(c, { items: [] });
});

communicationRoutes.post("/notifications", requireAuth, requirePermission("SEND_NOTIFICATIONS"), (c) => {
  return ok(c, { message: "Notification creation endpoint scaffolded" }, 201);
});
