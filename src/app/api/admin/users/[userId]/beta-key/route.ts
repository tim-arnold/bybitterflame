import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/errors";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/admin";
import { encryptApiKey, getEncryptionSecret } from "@/lib/crypto";

export const runtime = "nodejs";

function maskKey(key: string): string {
  return `sk-ant-...••••••${key.slice(-4)}`;
}

/**
 * POST /api/admin/users/[userId]/beta-key
 * Body (set/clear key):  { apiKey: string }
 * Body (change mode only): { mode: "trial" | "full" }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await getSession(request);
  if (!isAdmin(session)) {
    return apiError("Forbidden", 403);
  }

  const { userId } = await params;
  const body = (await request.json()) as { apiKey?: string; mode?: string };

  // Mode-only update
  if (body.mode !== undefined && body.apiKey === undefined) {
    if (body.mode !== "trial" && body.mode !== "full") {
      return apiError("mode must be trial or full", 400);
    }
    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);
    await db.update(users).set({ betaKeyMode: body.mode }).where(eq(users.id, userId));
    return NextResponse.json({ ok: true, mode: body.mode });
  }

  // Key set/clear
  const rawKey = (body.apiKey ?? "").trim();
  if (rawKey && !rawKey.startsWith("sk-ant-")) {
    return apiError("Invalid API key format. Key must start with sk-ant-", 400);
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const encrypted = rawKey
    ? await encryptApiKey(rawKey, getEncryptionSecret(env.API_KEY_ENCRYPTION_SECRET))
    : null;

  await db
    .update(users)
    .set({
      betaApiKey: encrypted,
      betaKeyMode: rawKey ? (body.mode === "full" ? "full" : "trial") : null,
    })
    .where(eq(users.id, userId));

  return NextResponse.json({
    ok: true,
    masked: rawKey ? maskKey(rawKey) : null,
    mode: rawKey ? (body.mode === "full" ? "full" : "trial") : null,
  });
}
