import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "./lib/env.js";
import { ApiError, fail, ok } from "./lib/errors.js";
import { auditRoutes } from "./modules/audit/routes.js";
import { attendanceRoutes } from "./modules/attendance/routes.js";
import { authRoutes } from "./modules/auth/routes.js";
import { communicationRoutes } from "./modules/communication/routes.js";
import { dashboardRoutes } from "./modules/dashboard/routes.js";
import { examRoutes } from "./modules/exams/routes.js";
import { feeRoutes } from "./modules/fees/routes.js";
import { leaveRoutes } from "./modules/leave/routes.js";
import { reportRoutes } from "./modules/reports/routes.js";
import { settingRoutes } from "./modules/settings/routes.js";
import { studentRoutes } from "./modules/students/routes.js";
import { teacherRoutes } from "./modules/teachers/routes.js";
import { userRoutes } from "./modules/users/routes.js";
import { auditContext } from "./middleware/audit-context.js";
import type { AppBindings } from "./types.js";

const app = new Hono<AppBindings>();

app.use("*", logger());
app.use("*", cors());
app.use("*", auditContext);

app.get("/health", (c) => {
  return ok(c, {
    status: "ok",
    service: "schoolos-api"
  });
});

app.route("/", authRoutes);
app.route("/", dashboardRoutes);
app.route("/", studentRoutes);
app.route("/", attendanceRoutes);
app.route("/", teacherRoutes);
app.route("/", leaveRoutes);
app.route("/", feeRoutes);
app.route("/", communicationRoutes);
app.route("/", examRoutes);
app.route("/", reportRoutes);
app.route("/", settingRoutes);
app.route("/", userRoutes);
app.route("/", auditRoutes);

app.notFound((c) => {
  return fail(c, new ApiError(404, "NOT_FOUND", "Route not found"));
});

app.onError((error, c) => {
  if (error instanceof ApiError) {
    return fail(c, error);
  }

  console.error(error);

  return fail(c, new ApiError(500, "INTERNAL_ERROR", "Unexpected server error"));
});

serve(
  {
    fetch: app.fetch,
    port: env.port
  },
  (info) => {
    console.log(`SchoolOS API listening on http://localhost:${info.port}`);
  }
);
