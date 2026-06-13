import { Hono } from "hono";
import { ok } from "../../lib/errors.js";
import { requireAuth } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/require-permission.js";
import type { AppBindings } from "../../types.js";

export const teacherRoutes = new Hono<AppBindings>();

teacherRoutes.get("/teachers", requireAuth, requirePermission("VIEW_TEACHERS"), (c) => {
  return ok(c, { items: [], nextCursor: null });
});

teacherRoutes.post("/teachers", requireAuth, requirePermission("MANAGE_TEACHERS"), (c) => {
  return ok(c, { message: "Teacher creation endpoint scaffolded" }, 201);
});
