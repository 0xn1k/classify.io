import { Hono } from "hono";
import { ok } from "../../lib/errors.js";
import { requireAuth } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/require-permission.js";
import type { AppBindings } from "../../types.js";

export const feeRoutes = new Hono<AppBindings>();

feeRoutes.get("/fee-plans", requireAuth, requirePermission("VIEW_FEES"), (c) => {
  return ok(c, { items: [] });
});

feeRoutes.post("/fee-plans", requireAuth, requirePermission("MANAGE_FEES"), (c) => {
  return ok(c, { message: "Fee plan creation endpoint scaffolded" }, 201);
});

feeRoutes.post("/payments", requireAuth, requirePermission("COLLECT_PAYMENTS"), (c) => {
  return ok(c, { message: "Payment collection endpoint scaffolded" }, 201);
});
