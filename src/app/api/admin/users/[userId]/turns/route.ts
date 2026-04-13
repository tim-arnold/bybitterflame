import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/errors";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Resend } from "resend";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/admin";
import { SERVER_KEY_TURN_LIMIT } from "@/lib/config";
import { emailHtml, emailP } from "@/lib/email/template";

export const runtime = "nodejs";

/**
 * PATCH /api/admin/users/[userId]/turns
 * Body: { bonus: number }  — sets serverKeyTurnsBonus to this absolute value
 * Sends the user a notification email when turns are increased.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await getSession(request);
  if (!isAdmin(session)) {
    return apiError("Forbidden", 403);
  }

  const { userId } = await params;
  const body = (await request.json()) as { bonus?: unknown };

  const bonus = Number(body.bonus);
  if (!Number.isInteger(bonus) || bonus < 0) {
    return apiError("bonus must be a non-negative integer", 400);
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const [user] = await db
    .select({
      name: users.name,
      email: users.email,
      serverKeyTurnsBonus: users.serverKeyTurnsBonus,
      serverKeyTurnsUsed: users.serverKeyTurnsUsed,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return apiError("User not found", 404);
  }

  const previousBonus = user.serverKeyTurnsBonus ?? 0;

  await db
    .update(users)
    .set({ serverKeyTurnsBonus: bonus })
    .where(eq(users.id, userId));

  // Send notification email to user when turns are increased
  if (bonus > previousBonus && env.RESEND_API_KEY) {
    const added = bonus - previousBonus;
    const newEffectiveLimit = SERVER_KEY_TURN_LIMIT + bonus;
    const remaining = Math.max(0, newEffectiveLimit - (user.serverKeyTurnsUsed ?? 0));
    const resend = new Resend(env.RESEND_API_KEY);
    const baseUrl = env.BETTER_AUTH_URL;

    await resend.emails.send({
      from: "By Bitter Flame <gm@bybitterflame.com>",
      to: user.email,
      subject: `You've earned ${added} bonus turns on By Bitter Flame`,
      html: emailHtml(`
        ${emailP(`Hi ${user.name},`)}
        ${emailP(`You&rsquo;ve been awarded <strong style="color:#d4c47a;">+${added} free turns</strong> on By Bitter Flame as a bounty reward.`)}
        ${emailP(`You now have <strong style="color:#d4c47a;">${remaining} turn${remaining !== 1 ? "s" : ""}</strong> remaining before you&rsquo;ll need to supply your own Anthropic API key.`, { muted: true })}
        ${emailP(`Thanks for helping make By Bitter Flame better &mdash; your feedback genuinely shapes the game.`, { muted: true })}
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
          <tr>
            <td style="border-radius:4px;background:#b5a642;">
              <a href="${baseUrl}" style="display:inline-block;padding:14px 28px;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;color:#1a1814;text-decoration:none;letter-spacing:0.03em;">Back to the Dungeon &rarr;</a>
            </td>
          </tr>
        </table>
      `),
    });
  }

  return NextResponse.json({ ok: true, bonus });
}
