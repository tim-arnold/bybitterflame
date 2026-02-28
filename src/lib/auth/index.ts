import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Resend } from "resend";
import { getDb } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";

let _auth: ReturnType<typeof betterAuth> | null = null;

export async function getAuth() {
  if (_auth) return _auth;

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);
  const resend = new Resend(process.env.RESEND_API_KEY);

  _auth = betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        user: schema.users,
        session: schema.authSessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),
    emailAndPassword: {
      enabled: true,
      sendResetPassword: async ({ user, url }) => {
        void resend.emails.send({
          from: "gm@bytorchlight.com",
          to: user.email,
          subject: "Reset your By Torchlight password",
          html: `
            <p>You requested a password reset for your By Torchlight account.</p>
            <p><a href="${url}">Click here to reset your password</a></p>
            <p>This link expires in 1 hour. If you didn't request this, you can safely ignore it.</p>
          `,
        });
      },
    },
  });

  return _auth;
}
