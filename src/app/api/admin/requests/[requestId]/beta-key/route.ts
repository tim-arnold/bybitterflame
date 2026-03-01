import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db/client";
import { accountRequests } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";

export const runtime = "nodejs";

const ADMIN_EMAIL = "gm@bytorchlight.com";

function maskKey(key: string): string {
  return `sk-ant-...••••••${key.slice(-4)}`;
}

/**
 * POST /api/admin/requests/[requestId]/beta-key
 * Body (set/clear key):  { apiKey: string }
 * Body (change mode only): { mode: "trial" | "full" }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ requestId: string }> },
) {
  const session = await getSession(request);
  if (!session || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { requestId } = await params;
  const body = (await request.json()) as { apiKey?: string; mode?: string };

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  // Mode-only update
  if (body.mode !== undefined && body.apiKey === undefined) {
    if (body.mode !== "trial" && body.mode !== "full") {
      return NextResponse.json({ error: "mode must be trial or full" }, { status: 400 });
    }
    await db
      .update(accountRequests)
      .set({ betaKeyMode: body.mode })
      .where(eq(accountRequests.id, requestId));
    return NextResponse.json({ ok: true, mode: body.mode });
  }

  // Key set/clear
  const rawKey = (body.apiKey ?? "").trim();
  if (rawKey && !rawKey.startsWith("sk-ant-")) {
    return NextResponse.json(
      { error: "Invalid API key format. Key must start with sk-ant-" },
      { status: 400 },
    );
  }

  await db
    .update(accountRequests)
    .set({
      betaApiKey: rawKey || null,
      betaKeyMode: rawKey ? (body.mode === "full" ? "full" : "trial") : "trial",
    })
    .where(eq(accountRequests.id, requestId));

  return NextResponse.json({
    ok: true,
    masked: rawKey ? maskKey(rawKey) : null,
    mode: rawKey ? (body.mode === "full" ? "full" : "trial") : "trial",
  });
}
