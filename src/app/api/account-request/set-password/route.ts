import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db/client";
import { accountRequests, users } from "@/lib/db/schema";
import { getAuth } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { token?: string; password?: string };
  const token = (body.token ?? "").trim();
  const password = (body.password ?? "").trim();

  if (!token || !password) {
    return NextResponse.json({ error: "Missing token or password" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const [req] = await db
    .select()
    .from(accountRequests)
    .where(eq(accountRequests.token, token))
    .limit(1);

  if (!req) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });
  }

  if (req.status === "completed") {
    return NextResponse.json({ error: "This setup link has already been used" }, { status: 400 });
  }

  if (req.status !== "approved") {
    return NextResponse.json({ error: "This link is not valid" }, { status: 400 });
  }

  const auth = await getAuth();
  try {
    await auth.api.signUpEmail({
      body: { email: req.email, name: req.name, password },
    });
  } catch {
    // User may already exist — try updating their password instead via a reset flow
    return NextResponse.json({ error: "Failed to create account. Please contact support." }, { status: 500 });
  }

  // Copy any pre-assigned beta key/mode to the new user row
  if (req.betaApiKey) {
    const [newUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, req.email))
      .limit(1);
    if (newUser) {
      await db
        .update(users)
        .set({ betaApiKey: req.betaApiKey, betaKeyMode: req.betaKeyMode })
        .where(eq(users.id, newUser.id));
    }
  }

  await db
    .update(accountRequests)
    .set({ status: "completed" })
    .where(eq(accountRequests.token, token));

  return NextResponse.json({ ok: true, email: req.email, name: req.name });
}
