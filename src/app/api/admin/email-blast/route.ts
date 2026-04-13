import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/errors";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Resend } from "resend";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/admin";
import { emailHtml, emailP, emailButton } from "@/lib/email/template";

export const runtime = "nodejs";

/**
 * POST /api/admin/email-blast
 * Body: { subject: string, body: string, ctaLabel?: string, ctaUrl?: string }
 * Sends an email to all registered users. Body supports simple line breaks (converted to paragraphs).
 */
export async function POST(request: Request) {
  const session = await getSession(request);
  if (!isAdmin(session)) {
    return apiError("Forbidden", 403);
  }

  const json = (await request.json()) as {
    subject?: string;
    body?: string;
    ctaLabel?: string;
    ctaUrl?: string;
  };

  const subject = (json.subject ?? "").trim();
  const body = (json.body ?? "").trim();
  const ctaLabel = (json.ctaLabel ?? "").trim();
  const ctaUrl = (json.ctaUrl ?? "").trim();

  if (!subject) return apiError("Subject is required", 400);
  if (!body) return apiError("Body is required", 400);
  if (subject.length > 200) return apiError("Subject too long (max 200)", 400);
  if (body.length > 5000) return apiError("Body too long (max 5000)", 400);

  const { env } = await getCloudflareContext({ async: true });

  if (!env.RESEND_API_KEY) {
    return apiError("RESEND_API_KEY not configured", 500);
  }

  const db = getDb(env.DB);
  const allUsers = await db
    .select({ name: users.name, email: users.email })
    .from(users);

  const resend = new Resend(env.RESEND_API_KEY);

  // Build HTML body: split on double newlines for paragraphs
  const paragraphs = body.split(/\n\n+/).filter(Boolean);
  const htmlBody = paragraphs
    .map((p, i) => {
      // First paragraph gets the gold color, rest are muted
      return emailP(p.replace(/\n/g, "<br>"), i === 0 ? {} : { muted: true });
    })
    .join("");

  const ctaHtml = ctaLabel && ctaUrl ? emailButton(ctaLabel, ctaUrl) : "";

  let sent = 0;
  const errors: string[] = [];

  for (const user of allUsers) {
    // Personalize greeting
    const greeting = emailP(`Hi ${user.name || "adventurer"},`);
    const html = emailHtml(`${greeting}${htmlBody}${ctaHtml}`);

    try {
      await resend.emails.send({
        from: "By Bitter Flame <gm@bybitterflame.com>",
        to: user.email,
        subject,
        html,
      });
      sent++;
    } catch (err) {
      errors.push(`${user.email}: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  }

  return NextResponse.json({ ok: true, sent, total: allUsers.length, errors });
}
