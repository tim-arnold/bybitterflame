import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/errors";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Resend } from "resend";
import { getDb } from "@/lib/db/client";
import { users, accountRequests } from "@/lib/db/schema";
import { emailHtml, emailP, emailButton } from "@/lib/email/template";
import { checkRateLimit } from "@/lib/auth/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { name?: string; email?: string };
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();

  if (!name || !email) {
    return apiError("Name and email are required", 400);
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  // Rate limit: 5 requests per hour per IP
  const ip = request.headers.get("CF-Connecting-IP") ?? request.headers.get("x-forwarded-for") ?? "unknown";
  try {
    const allowed = await checkRateLimit(db, `account-request:${ip}`, { limit: 5, windowSecs: 3600 });
    if (!allowed) {
      return apiError("Too many requests", 429);
    }
  } catch {
    // Non-critical — allow through if rate limit check fails (e.g. migration not yet run)
  }

  // Check if user already exists — return success silently (no enumeration)
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    return NextResponse.json({ ok: true });
  }

  // Check if a pending request already exists — return success silently
  const [existingRequest] = await db
    .select({ id: accountRequests.id })
    .from(accountRequests)
    .where(eq(accountRequests.email, email))
    .limit(1);

  if (existingRequest) {
    return NextResponse.json({ ok: true });
  }

  const id = crypto.randomUUID();
  const token = crypto.randomUUID();
  const now = Date.now();

  await db.insert(accountRequests).values({ id, name, email, token, status: "pending", createdAt: now });

  const approvalUrl = `${env.BETTER_AUTH_URL}/api/account-request/approve?token=${token}`;

  const resend = new Resend(env.RESEND_API_KEY);
  await resend.emails.send({
    from: "By Bitter Flame <gm@bybitterflame.com>",
    to: "gm@bybitterflame.com",
    subject: `New account request: ${name} (${email})`,
    html: emailHtml(`
      ${emailP(`<strong style="color:#d4c47a;">${name}</strong> &lt;${email}&gt; has requested access.`)}
      ${emailButton("Approve Account", approvalUrl)}
    `),
  });

  return NextResponse.json({ ok: true });
}
