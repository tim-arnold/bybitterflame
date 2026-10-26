import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Resend } from "resend";
import { getDb } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";
import { emailHtml, emailP, emailButton } from "@/lib/email/template";

/**
 * Send a transactional auth email and wait for it. Awaiting matters on
 * Workers: an un-awaited send can be cut off when the response finishes.
 * Resend reports failures in the result rather than throwing, so log them.
 */
async function sendAuthEmail(to: string, subject: string, html: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: "By Bitter Flame <gm@bybitterflame.com>",
    to,
    subject,
    html,
  });
  if (error) console.error(`[auth email] "${subject}" to ${to} failed:`, error);
}

/**
 * Point a better-auth email link's post-click redirect at a specific page.
 * better-auth reuses the approval link's callbackURL for the follow-up
 * verification link, so each email sets its own.
 */
function withCallbackURL(url: string, callbackURL: string): string {
  const u = new URL(url);
  u.searchParams.set("callbackURL", callbackURL);
  return u.toString();
}

function createAuth(db: ReturnType<typeof getDb>) {
  return betterAuth({
    trustedOrigins: ["http://localhost:3000", "http://localhost:3001", "https://bybitterflame.com"],
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        user: schema.users,
        session: schema.authSessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),
    emailVerification: {
      sendOnSignUp: false,
      sendVerificationEmail: async ({ user, url }) => {
        await sendAuthEmail(
          user.email,
          "Verify your By Bitter Flame email",
          emailHtml(`
            ${emailP("Click below to verify this email address for your By Bitter Flame account.")}
            ${emailButton("Verify Email Address", withCallbackURL(url, "/api/account/email-changed"))}
            ${emailP("This link expires in 1 hour. If you didn't request this, you can safely ignore it.", { muted: true, small: true, spaceBelow: "0" })}
          `),
        );
      },
    },
    user: {
      deleteUser: {
        enabled: true,
      },
      changeEmail: {
        enabled: true,
        sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
          await sendAuthEmail(
            user.email,
            "Confirm your By Bitter Flame email change",
            emailHtml(`
              ${emailP(`You requested to change your By Bitter Flame account email to ${newEmail}. Click below to approve the change. A verification link will then go to the new address.`)}
              ${emailButton("Approve Email Change", withCallbackURL(url, "/email-change-confirmed"))}
              ${emailP("This link expires in 1 hour. If you didn't request this, you can safely ignore it.", { muted: true, small: true, spaceBelow: "0" })}
            `),
          );
        },
      },
    },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
      sendResetPassword: async ({ user, url }) => {
        await sendAuthEmail(
          user.email,
          "Reset your By Bitter Flame password",
          emailHtml(`
            ${emailP(`Hi ${user.name},`)}
            ${emailP("You requested a password reset for your By Bitter Flame account. Click below to choose a new password.", { muted: true })}
            ${emailButton("Reset Password", url)}
            ${emailP("This link expires in 1 hour. If you didn't request this, you can safely ignore it.", { muted: true, small: true, spaceBelow: "0" })}
          `),
        );
      },
    },
  });
}

let _auth: ReturnType<typeof createAuth> | null = null;

export async function getAuth() {
  if (_auth) return _auth;

  const { env } = await getCloudflareContext({ async: true });
  const auth = createAuth(getDb(env.DB));
  _auth = auth;
  return auth;
}
