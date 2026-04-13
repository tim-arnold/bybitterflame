import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/errors";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { SERVER_KEY_TURN_LIMIT } from "@/lib/config";
import { encryptApiKey, decryptApiKey, getEncryptionSecret } from "@/lib/crypto";

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
    return apiError("Unauthorized", 401);
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const [user] = await db
    .select({
      anthropicApiKey: users.anthropicApiKey,
      betaApiKey: users.betaApiKey,
      betaKeyMode: users.betaKeyMode,
      serverKeyTurnsUsed: users.serverKeyTurnsUsed,
      serverKeyTurnsBonus: users.serverKeyTurnsBonus,
      totalInputTokens: users.totalInputTokens,
      totalOutputTokens: users.totalOutputTokens,
      totalCacheWriteTokens: users.totalCacheWriteTokens,
      totalCacheReadTokens: users.totalCacheReadTokens,
      haikuInputTokens: users.haikuInputTokens,
      haikuOutputTokens: users.haikuOutputTokens,
      haikuCacheWriteTokens: users.haikuCacheWriteTokens,
      haikuCacheReadTokens: users.haikuCacheReadTokens,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) {
    return apiError("User not found", 404);
  }

  const secret = getEncryptionSecret(env.API_KEY_ENCRYPTION_SECRET);

  // Decrypt stored keys to check format and produce masked display
  const decryptedOwn = user.anthropicApiKey
    ? await decryptApiKey(user.anthropicApiKey, secret)
    : null;
  const decryptedBeta = user.betaApiKey
    ? await decryptApiKey(user.betaApiKey, secret)
    : null;

  // On trial if: no own key, and no beta key in full mode
  const isOnTrial =
    !decryptedOwn?.startsWith("sk-ant-") &&
    !(decryptedBeta?.startsWith("sk-ant-") && user.betaKeyMode === "full");

  const turnsLimit = SERVER_KEY_TURN_LIMIT + (user.serverKeyTurnsBonus ?? 0);

  return NextResponse.json({
    hasKey: !!decryptedOwn,
    maskedKey: decryptedOwn ? maskKey(decryptedOwn) : null,
    turnsUsed: user.serverKeyTurnsUsed,
    turnsLimit,
    isOnTrial,
    totalInputTokens: user.totalInputTokens,
    totalOutputTokens: user.totalOutputTokens,
    totalCacheWriteTokens: user.totalCacheWriteTokens,
    totalCacheReadTokens: user.totalCacheReadTokens,
    haikuInputTokens: user.haikuInputTokens,
    haikuOutputTokens: user.haikuOutputTokens,
    haikuCacheWriteTokens: user.haikuCacheWriteTokens,
    haikuCacheReadTokens: user.haikuCacheReadTokens,
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
    return apiError("Unauthorized", 401);
  }

  const body = (await request.json()) as { apiKey?: string };
  const rawKey = (body.apiKey ?? "").trim();

  // Validate: must be empty (clear) or start with sk-ant-
  if (rawKey && !rawKey.startsWith("sk-ant-")) {
    return apiError("Invalid API key format. Key must start with sk-ant-", 400);
  }

  // Verify the key actually works before saving
  if (rawKey) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": rawKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1,
          messages: [{ role: "user", content: "hi" }],
        }),
      });
      if (res.status === 401 || res.status === 403) {
        return apiError("That API key was rejected by Anthropic. Please check that it's correct and active.", 400);
      }
    } catch {
      // Network error — let it through rather than blocking the save
    }
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);
  const secret = getEncryptionSecret(env.API_KEY_ENCRYPTION_SECRET);

  const encrypted = rawKey
    ? await encryptApiKey(rawKey, secret)
    : null;

  await db
    .update(users)
    .set({
      anthropicApiKey: encrypted,
      // Clear any admin-assigned beta key when the user supplies their own key
      ...(rawKey ? { betaApiKey: null, betaKeyMode: null } : {}),
    })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({
    ok: true,
    maskedKey: rawKey ? maskKey(rawKey) : null,
  });
}
