import { getConnInfo } from "@hono/node-server/conninfo";
import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { ApiError } from "../lib/errors.js";
import type { AppBindings } from "../types.js";

type Bucket = { count: number; resetAt: number };

export type RateLimitOptions = {
  // Unique name so different routes keep separate counters (e.g. "login" vs "otp").
  name: string;
  // Rolling window length in milliseconds.
  windowMs: number;
  // Max requests allowed per client within the window.
  max: number;
};

// Resolve the caller's IP. Honours a single trusted proxy hop (x-forwarded-for / x-real-ip)
// and falls back to the socket address for direct connections (e.g. local dev).
function clientIp(c: Context<AppBindings>): string {
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]!.trim();
  }
  const real = c.req.header("x-real-ip");
  if (real) {
    return real.trim();
  }
  // getConnInfo is typed against Hono's base Context<Env>; our context is a structural
  // subtype, so cast at this one boundary rather than loosen the helper's signature.
  return getConnInfo(c as unknown as Parameters<typeof getConnInfo>[0]).remote.address ?? "unknown";
}

// In-memory fixed-window limiter. Good enough for a single API instance; swap the Map for
// Redis if you scale horizontally. Stale buckets are pruned lazily as keys are touched.
export function rateLimit(options: RateLimitOptions) {
  const buckets = new Map<string, Bucket>();

  return createMiddleware<AppBindings>(async (c, next) => {
    const now = Date.now();
    const key = `${options.name}:${clientIp(c)}`;
    const existing = buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    } else {
      existing.count += 1;
      if (existing.count > options.max) {
        const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
        c.header("Retry-After", String(retryAfter));
        throw new ApiError(
          429,
          "RATE_LIMITED",
          "Too many attempts. Please wait a moment and try again."
        );
      }
    }

    // Opportunistic cleanup so the Map doesn't grow without bound.
    if (buckets.size > 5000) {
      for (const [k, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(k);
      }
    }

    await next();
  });
}
