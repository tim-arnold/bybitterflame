import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";

export const runtime = "nodejs";

function maskKey(key: string): string {
  // Show "sk-ant-...••••••XXXX" (last 4 chars visible)
  const last4 = key.slice(-4);
  return `sk-ant-...••••••${last4}`;
}

/**
 * GET /api/user/api-key
 * Returns whether the user has an API key set, and a masked version if so.
 */
export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const [user] = await db
    .select({ anthropicApiKey: users.anthropicApiKey, serverKeyTurnsUsed: users.serverKeyTurnsUsed })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    hasKey: !!user.anthropicApiKey,
    maskedKey: user.anthropicApiKey ? maskKey(user.anthropicApiKey) : null,
    turnsUsed: user.serverKeyTurnsUsed,
  });
}

/**
 * POST /api/user/api-key
 * Save or clear the user's Anthropic API key.
 * Body: { apiKey: string }  — empty string clears the key.
 */
export async function POST(request: Request) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { apiKey?: string };
  const rawKey = (body.apiKey ?? "").trim();

  // Validate: must be empty (clear) or start with sk-ant-
  if (rawKey && !rawKey.startsWith("sk-ant-")) {
    return NextResponse.json(
      { error: "Invalid API key format. Key must start with sk-ant-" },
      { status: 400 },
    );
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  await db
    .update(users)
    .set({ anthropicApiKey: rawKey || null })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({
    ok: true,
    maskedKey: rawKey ? maskKey(rawKey) : null,
  });
}
