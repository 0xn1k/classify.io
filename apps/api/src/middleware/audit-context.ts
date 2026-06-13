import { createMiddleware } from "hono/factory";
import type { AppBindings } from "../types.js";

export const auditContext = createMiddleware<AppBindings>(async (c, next) => {
  c.set("audit", {
    ipAddress: c.req.header("x-forwarded-for")?.split(",")[0]?.trim(),
    userAgent: c.req.header("user-agent")
  });

  await next();
});
