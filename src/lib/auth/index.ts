import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Resend } from "resend";
import { getDb } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";
import { emailHtml, emailP, emailButton } from "@/lib/email/template";

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
        const resend = new Resend(process.env.RESEND_API_KEY);
        void resend.emails.send({
          from: "By Bitter Flame <gm@bybitterflame.com>",
          to: user.email,
          subject: "Verify your By Bitter Flame email",
          html: emailHtml(`
            ${emailP("Please verify your email address to complete your By Bitter Flame account setup.")}
            ${emailButton("Verify Email Address", url)}
            ${emailP("This link expires in 1 hour. If you didn't request this, you can safely ignore it.", { muted: true, small: true, spaceBelow: "0" })}
          `),
        });
      },
    },
    user: {
      deleteUser: {
        enabled: true,
      },
      changeEmail: {
        enabled: true,
        sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
          const resend = new Resend(process.env.RESEND_API_KEY);
          void resend.emails.send({
            from: "By Bitter Flame <gm@bybitterflame.com>",
            to: user.email,
            subject: "Confirm your By Bitter Flame email change",
            html: emailHtml(`
              ${emailP(`You requested to change your By Bitter Flame account email to ${newEmail}. Click below to approve the change. We'll then send a verification link to the new address.`)}
              ${emailButton("Approve Email Change", url)}
              ${emailP("This link expires in 1 hour. If you didn't request this, you can safely ignore it.", { muted: true, small: true, spaceBelow: "0" })}
            `),
          });
        },
      },
    },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
      sendResetPassword: async ({ user, url }) => {
        const resend = new Resend(process.env.RESEND_API_KEY);
        void resend.emails.send({
          from: "By Bitter Flame <gm@bybitterflame.com>",
          to: user.email,
          subject: "Reset your By Bitter Flame password",
          html: emailHtml(`
            ${emailP(`Hi ${user.name},`)}
            ${emailP("You requested a password reset for your By Bitter Flame account. Click below to choose a new password.", { muted: true })}
            ${emailButton("Reset Password", url)}
            ${emailP("This link expires in 1 hour. If you didn't request this, you can safely ignore it.", { muted: true, small: true, spaceBelow: "0" })}
          `),
        });
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
