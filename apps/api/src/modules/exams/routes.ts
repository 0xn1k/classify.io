import { Hono } from "hono";
import { ok } from "../../lib/errors.js";
import { requireAuth } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/require-permission.js";
import type { AppBindings } from "../../types.js";

export const examRoutes = new Hono<AppBindings>();

examRoutes.get("/exams", requireAuth, requirePermission("MANAGE_EXAMS"), (c) => {
  return ok(c, { items: [] });
});

examRoutes.post("/exams", requireAuth, requirePermission("MANAGE_EXAMS"), (c) => {
  return ok(c, { message: "Exam creation endpoint scaffolded" }, 201);
});

examRoutes.post("/marks", requireAuth, requirePermission("ENTER_MARKS"), (c) => {
  return ok(c, { message: "Marks entry endpoint scaffolded" }, 201);
});
