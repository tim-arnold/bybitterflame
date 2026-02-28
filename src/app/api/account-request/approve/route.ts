import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Resend } from "resend";
import { getDb } from "@/lib/db/client";
import { accountRequests } from "@/lib/db/schema";
import { getAuth } from "@/lib/auth";

export const runtime = "nodejs";

function htmlPage(title: string, body: string) {
  return new Response(
    `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${title}</title>
    <style>body{font-family:sans-serif;background:#0f0f0f;color:#d4c47a;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
    .card{background:#1c1917;border:1px solid #292524;border-radius:8px;padding:2rem;max-width:400px;text-align:center;}
    h1{margin:0 0 1rem;}p{color:#a8a29e;margin:0;}</style>
    </head><body><div class="card"><h1>${title}</h1><p>${body}</p></div></body></html>`,
    { headers: { "Content-Type": "text/html" } },
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") ?? "";

  if (!token) {
    return htmlPage("Invalid Link", "This approval link is missing a token.");
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const [req] = await db
    .select()
    .from(accountRequests)
    .where(eq(accountRequests.token, token))
    .limit(1);

  if (!req) {
    return htmlPage("Invalid Link", "This approval link is invalid or has already been used.");
  }

  if (req.status !== "pending") {
    return htmlPage("Already Approved", "This account has already been approved.");
  }

  // Create the user account via BetterAuth
  const auth = await getAuth();
  try {
    await auth.api.signUpEmail({
      body: {
        email: req.email,
        name: req.name,
        password: crypto.randomUUID(),
      },
    });
  } catch {
    // User may already exist (race condition) — continue
  }

  // Mark request as approved
  await db
    .update(accountRequests)
    .set({ status: "approved" })
    .where(eq(accountRequests.token, token));

  // Send notification email to requester
  const forgotPasswordUrl = `${env.BETTER_AUTH_URL}/forgot-password`;
  const resend = new Resend(env.RESEND_API_KEY);
  await resend.emails.send({
    from: "gm@bytorchlight.com",
    to: req.email,
    subject: "Your By Torchlight account is ready",
    html: `
      <p>Hi ${req.name},</p>
      <p>Your By Torchlight account has been approved!</p>
      <p>Click below to set your password and start playing:</p>
      <p>
        <a href="${forgotPasswordUrl}" style="display:inline-block;padding:10px 20px;background:#b5a642;color:#1a1a1a;text-decoration:none;border-radius:4px;font-weight:bold;">
          Set Your Password
        </a>
      </p>
      <p style="font-size:0.85em;color:#666;">Or visit: ${forgotPasswordUrl}</p>
    `,
  });

  return htmlPage(
    "Account Approved!",
    `${req.name} (${req.email}) has been approved. They&apos;ll receive an email with a link to set their password.`,
  );
}
