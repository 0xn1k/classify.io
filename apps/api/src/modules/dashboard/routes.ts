import { Hono } from "hono";
import { ok } from "../../lib/errors.js";
import { requireAuth } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/require-permission.js";
import type { AppBindings } from "../../types.js";

export const dashboardRoutes = new Hono<AppBindings>();

dashboardRoutes.get(
  "/dashboard/summary",
  requireAuth,
  requirePermission("VIEW_DASHBOARD"),
  (c) => {
    return ok(c, {
      students: { total: 0, active: 0, newAdmissions: 0 },
      attendance: { todayPercentage: null, absentStudents: 0, teacherPercentage: null },
      fees: { collectedThisMonth: "0", pendingFees: "0", defaulters: 0 },
      teachers: { total: 0, presentToday: 0, pendingLeaveRequests: 0 },
      exams: { scheduled: 0, resultsPending: 0 }
    });
  }
);
