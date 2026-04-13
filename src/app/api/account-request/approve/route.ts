import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Resend } from "resend";
import { getDb } from "@/lib/db/client";
import { accountRequests } from "@/lib/db/schema";

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

  // Mark request as approved (user account created when they set their password)
  await db
    .update(accountRequests)
    .set({ status: "approved" })
    .where(eq(accountRequests.token, token));

  // Send setup email — link goes directly to the create-password page
  const baseUrl = env.BETTER_AUTH_URL;
  const setupUrl = `${baseUrl}/create-password?token=${req.token}`;
  const resend = new Resend(env.RESEND_API_KEY);
  await resend.emails.send({
    from: "By Bitter Flame <gm@bybitterflame.com>",
    to: req.email,
    subject: "Your By Bitter Flame account is ready",
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your By Bitter Flame account is ready</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;">

<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background:#0a0a0a;">
<tr><td align="center" style="padding:24px 16px 40px;">

  <!-- Card -->
  <table role="presentation" width="600" border="0" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:8px;overflow:hidden;border:1px solid #292524;">

    <!-- Header image (logo + dungeon background combined) -->
    <tr>
      <td style="padding:0;line-height:0;">
        <img src="${baseUrl}/bybitterflame-emailheader.png"
             width="600" alt="By Bitter Flame"
             style="display:block;width:100%;" />
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="background:#141210;padding:36px 40px;">

        <p style="margin:0 0 20px;font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#d4c47a;">
          Hi ${req.name},
        </p>

        <p style="margin:0 0 20px;font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#c9b96d;">
          Your account has been approved. <strong style="color:#d4c47a;">Welcome to the beta.</strong>
        </p>

        <p style="margin:0 0 20px;font-family:Georgia,serif;font-size:15px;line-height:1.7;color:#a8a29e;">
          By Bitter Flame is an AI-powered Fantasy Adventure set in a folklore-inspired world.
          You'll create a character through a guided conversation, then explore its fading ruins by torchlight &mdash;
          fighting monsters, uncovering story, and surviving session to session.
        </p>

        <!-- Free turns callout -->
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
          <tr>
            <td style="background:#1f1c18;border:1px solid #b5a64255;border-left:3px solid #b5a642;border-radius:4px;padding:16px 20px;">
              <p style="margin:0;font-family:Georgia,serif;font-size:15px;line-height:1.6;color:#d4c47a;">
                &#9876; As a beta tester, you start with <strong>20 free turns</strong> to play &mdash; enough
                to create a character and run your first session. More turns can be unlocked as the beta progresses.
              </p>
            </td>
          </tr>
        </table>

        <p style="margin:0 0 28px;font-family:Georgia,serif;font-size:15px;line-height:1.7;color:#a8a29e;">
          <strong style="color:#d4c47a;">Find a bug? Have an idea?</strong> Use the
          <strong style="color:#d4c47a;">Submit a Bug</strong> and
          <strong style="color:#d4c47a;">Suggest Feature</strong> links in the site header
          to send feedback directly. Your reports are invaluable at this stage &mdash;
          accepted feature suggestions earn <strong style="color:#d4c47a;">+20 free turns</strong>,
          and bug reports that make it into a release earn
          <strong style="color:#d4c47a;">+10 free turns</strong>. It&rsquo;s like a bounty!
        </p>

        <p style="margin:0 0 24px;font-family:Georgia,serif;font-size:15px;line-height:1.6;color:#a8a29e;">
          When you're ready, set your password and begin your first adventure:
        </p>

        <!-- CTA button -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
          <tr>
            <td style="border-radius:4px;background:#b5a642;">
              <a href="${setupUrl}"
                 style="display:inline-block;padding:14px 28px;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;color:#1a1814;text-decoration:none;letter-spacing:0.03em;">
                Set Up Your Account &rarr;
              </a>
            </td>
          </tr>
        </table>

        <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#57534e;word-break:break-all;">
          Or copy this link: <a href="${setupUrl}" style="color:#78716c;">${setupUrl}</a>
        </p>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background:#0f0e0c;padding:16px 40px;border-top:1px solid #1c1917;">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#44403c;text-align:center;">
          By Bitter Flame &mdash; AI Fantasy Adventure &mdash; Beta
        </p>
      </td>
    </tr>

  </table>

</td></tr>
</table>

</body>
</html>`,
  });

  return htmlPage(
    "Account Approved!",
    `${req.name} (${req.email}) has been approved. They&apos;ll receive an email with a link to set their password.`,
  );
}
