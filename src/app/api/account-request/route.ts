import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Resend } from "resend";
import { getDb } from "@/lib/db/client";
import { users, accountRequests } from "@/lib/db/schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { name?: string; email?: string };
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

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

  const approvalUrl = `${process.env.BETTER_AUTH_URL}/api/account-request/approve?token=${token}`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  void resend.emails.send({
    from: "noreply@tim52.io",
    to: "tim@tim52.io",
    subject: `New account request: ${name} (${email})`,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p>
        <a href="${approvalUrl}" style="display:inline-block;padding:10px 20px;background:#b5a642;color:#1a1a1a;text-decoration:none;border-radius:4px;font-weight:bold;">
          Approve Account
        </a>
      </p>
      <p style="font-size:0.85em;color:#666;">Or copy this link: ${approvalUrl}</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
