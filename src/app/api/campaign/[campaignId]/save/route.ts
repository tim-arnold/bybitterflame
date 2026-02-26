import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db/client";
import { characters, campaigns, sessions } from "@/lib/db/schema";
import type { Character, Campaign, Message } from "@/lib/game/types";

export const runtime = "nodejs";

/**
 * POST /api/campaign/[campaignId]/save
 * Persist campaign state, character data, and message history.
 * Called automatically after each AI response and on manual save.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  const { campaignId } = await params;

  try {
    const body = await request.json() as {
      character?: Partial<Character>;
      campaign?: Partial<Campaign>;
      messages?: Message[];
      sessionNumber?: number;
    };
    const { character: charData, campaign: campaignData, messages: messageData, sessionNumber = 1 } = body;

    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);

    const [campaignRow] = await db
      .select({ characterId: campaigns.characterId })
      .from(campaigns)
      .where(eq(campaigns.id, campaignId))
      .limit(1);

    if (!campaignRow) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const now = new Date().toISOString();

    if (charData) {
      await db
        .update(characters)
        .set({
          hp: charData.hp,
          maxHp: charData.maxHp,
          xp: charData.xp,
          level: charData.level,
          gold: charData.gold,
          silver: charData.silver,
          copper: charData.copper,
          deity: charData.deity,
          languages: JSON.stringify(charData.languages ?? []),
          equipment: JSON.stringify(charData.equipment ?? []),
          updatedAt: now,
        })
        .where(eq(characters.id, campaignRow.characterId));
    }

    if (campaignData) {
      await db
        .update(campaigns)
        .set({
          worldState: JSON.stringify(campaignData.worldState ?? {}),
          gmPersona: campaignData.gmPersona ?? "",
          updatedAt: now,
        })
        .where(eq(campaigns.id, campaignId));
    }

    if (messageData !== undefined) {
      const sessionId = `${campaignId}-s${sessionNumber}`;
      await db
        .insert(sessions)
        .values({
          id: sessionId,
          campaignId,
          sessionNumber,
          messages: JSON.stringify(messageData),
          gameStateSnapshot: JSON.stringify({}),
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: sessions.id,
          set: {
            messages: JSON.stringify(messageData),
            updatedAt: now,
          },
        });
    }

    return NextResponse.json({ success: true, campaignId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Campaign save error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}