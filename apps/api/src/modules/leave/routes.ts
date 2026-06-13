import { Hono } from "hono";
import { ok } from "../../lib/errors.js";
import { requireAuth } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/require-permission.js";
import type { AppBindings } from "../../types.js";

export const leaveRoutes = new Hono<AppBindings>();

leaveRoutes.get("/leave-requests", requireAuth, requirePermission("MANAGE_LEAVE_REQUESTS"), (c) => {
  return ok(c, { items: [] });
});

leaveRoutes.post("/leave-requests", requireAuth, requirePermission("APPLY_LEAVE"), (c) => {
  return ok(c, { message: "Leave request creation endpoint scaffolded" }, 201);
});
