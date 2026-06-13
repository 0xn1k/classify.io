import { Hono } from "hono";
import { ok } from "../../lib/errors.js";
import { requireAuth } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/require-permission.js";
import type { AppBindings } from "../../types.js";

export const studentRoutes = new Hono<AppBindings>();

studentRoutes.get("/students", requireAuth, requirePermission("VIEW_STUDENTS"), (c) => {
  return ok(c, { items: [], nextCursor: null });
});

studentRoutes.post("/students", requireAuth, requirePermission("MANAGE_STUDENTS"), (c) => {
  return ok(c, { message: "Student creation endpoint scaffolded" }, 201);
});
