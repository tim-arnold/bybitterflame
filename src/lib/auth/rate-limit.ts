import type { DrizzleD1Database } from "drizzle-orm/d1";
import { sql } from "drizzle-orm";

export interface RateLimitConfig {
  /** Max requests allowed within the window */
  limit: number;
  /** Window duration in seconds */
  windowSecs: number;
}

/**
 * Simple D1-backed sliding-window rate limiter.
 *
 * Returns true if the request is allowed, false if the limit has been exceeded.
 * Cleans up expired windows as a side effect.
 */
export async function checkRateLimit(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: DrizzleD1Database<any>,
  key: string,
  config: RateLimitConfig,
): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - (now % config.windowSecs);
  const expiredBefore = windowStart - config.windowSecs;

  // Delete stale windows (best-effort; ignore failures)
  try {
    await db.run(
      sql`DELETE FROM rate_limits WHERE key = ${key} AND window_start < ${expiredBefore}`,
    );
  } catch {
    // Non-critical cleanup — ignore
  }

  // Upsert counter for the current window
  await db.run(
    sql`INSERT INTO rate_limits (key, window_start, count)
        VALUES (${key}, ${windowStart}, 1)
        ON CONFLICT (key, window_start) DO UPDATE SET count = count + 1`,
  );

  // Read back the current count
  const row = await db.get<{ count: number }>(
    sql`SELECT count FROM rate_limits WHERE key = ${key} AND window_start = ${windowStart}`,
  );

  return (row?.count ?? 1) <= config.limit;
}
