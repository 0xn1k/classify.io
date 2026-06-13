import { Hono } from "hono";
import { ok } from "../../lib/errors.js";
import { requireAuth } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/require-permission.js";
import type { AppBindings } from "../../types.js";

export const attendanceRoutes = new Hono<AppBindings>();

attendanceRoutes.get(
  "/attendance/students",
  requireAuth,
  requirePermission("MARK_STUDENT_ATTENDANCE"),
  (c) => ok(c, { items: [] })
);

attendanceRoutes.post(
  "/attendance/students",
  requireAuth,
  requirePermission("MARK_STUDENT_ATTENDANCE"),
  (c) => ok(c, { message: "Student attendance bulk save endpoint scaffolded" }, 201)
);

attendanceRoutes.get(
  "/attendance/teachers",
  requireAuth,
  requirePermission("MANAGE_TEACHER_ATTENDANCE"),
  (c) => ok(c, { items: [] })
);

attendanceRoutes.post(
  "/attendance/teachers",
  requireAuth,
  requirePermission("MANAGE_TEACHER_ATTENDANCE"),
  (c) => ok(c, { message: "Teacher attendance save endpoint scaffolded" }, 201)
);
