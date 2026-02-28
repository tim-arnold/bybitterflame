import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db/client";
import { campaigns, sessions } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import type { Message } from "@/lib/game/types";

export const runtime = "nodejs";

const HAIKU_MODEL = "claude-haiku-4-5-20251001";

const SUMMARIZE_SYSTEM_PROMPT = `You are a session recorder for a Shadowdark RPG campaign. Given a session's chat log between a player and their GM, write a concise session summary for the GM's records.

Format:
One paragraph (3–5 sentences) of narrative recap, followed by a bullet list of key events.

Focus on:
- Where the session started and ended (locations)
- Major encounters, decisions, and outcomes
- NPCs met or killed
- Items gained or lost
- XP or level-ups
- Unresolved threads or cliffhangers

Keep it under 250 words. Write in past tense. Do not mention dice rolls or game mechanics — summarize what happened narratively.`;

/**
 * POST /api/campaign/[campaignId]/summarize
 * Generates a compact Haiku summary of the current session and saves it to sessions.summary.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  const { campaignId } = await params;

  try {
    const authSession = await getSession(request);
    if (!authSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json() as { sessionNumber?: number };
    const { sessionNumber = 1 } = body;

    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);

    // Verify campaign ownership
    const [campaign] = await db
      .select({ userId: campaigns.userId })
      .from(campaigns)
      .where(eq(campaigns.id, campaignId))
      .limit(1);

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    if (campaign.userId && campaign.userId !== authSession.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const sessionId = `${campaignId}-s${sessionNumber}`;
    const [gameSession] = await db
      .select({ messages: sessions.messages })
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (!gameSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const messages: Message[] = JSON.parse(gameSession.messages);
    // Filter to visible, non-hidden messages and strip gamestate blocks
    const chatLog = messages
      .filter((m) => !m.hidden)
      .map((m) => {
        const cleaned = m.content.replace(/```gamestate[\s\S]*?```/g, "").trim();
        return `${m.role === "user" ? "Player" : "GM"}: ${cleaned}`;
      })
      .filter((line) => line.length > 10)
      .join("\n\n");

    if (!chatLog) {
      return NextResponse.json({ error: "No content to summarize" }, { status: 400 });
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await anthropic.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 512,
      system: SUMMARIZE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: `Session log:\n\n${chatLog}` }],
    });

    const summary =
      response.content[0].type === "text" ? response.content[0].text.trim() : "";

    if (!summary) {
      return NextResponse.json({ error: "Summary generation failed" }, { status: 500 });
    }

    // Save summary to the session row
    const now = new Date().toISOString();
    await db
      .update(sessions)
      .set({ summary, updatedAt: now })
      .where(eq(sessions.id, sessionId));

    return NextResponse.json({ summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Summarize error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
