import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db/client";
import { characters, campaigns, sessions } from "@/lib/db/schema";
import type { Character, Campaign, Message } from "@/lib/game/types";
import { getSession } from "@/lib/auth/session";

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
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      .select({ characterId: campaigns.characterId, userId: campaigns.userId })
      .from(campaigns)
      .where(eq(campaigns.id, campaignId))
      .limit(1);

    if (!campaignRow) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaignRow.userId && campaignRow.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date().toISOString();

    if (charData) {
      await db
        .update(characters)
        .set({
          ...(charData.name !== undefined && { name: charData.name }),
          ...(charData.pronouns !== undefined && { pronouns: charData.pronouns }),
          ...(charData.ancestry !== undefined && { ancestry: charData.ancestry }),
          ...(charData.class !== undefined && { class: charData.class }),
          ...(charData.alignment !== undefined && { alignment: charData.alignment }),
          ...(charData.background !== undefined && { background: charData.background }),
          ...(charData.str !== undefined && { str: charData.str }),
          ...(charData.dex !== undefined && { dex: charData.dex }),
          ...(charData.con !== undefined && { con: charData.con }),
          ...(charData.int !== undefined && { int: charData.int }),
          ...(charData.wis !== undefined && { wis: charData.wis }),
          ...(charData.cha !== undefined && { cha: charData.cha }),
          ...(charData.hp !== undefined && { hp: charData.hp }),
          ...(charData.maxHp !== undefined && { maxHp: charData.maxHp }),
          ...(charData.ac !== undefined && { ac: charData.ac }),
          ...(charData.xp !== undefined && { xp: charData.xp }),
          ...(charData.level !== undefined && { level: charData.level }),
          ...(charData.gold !== undefined && { gold: charData.gold }),
          ...(charData.silver !== undefined && { silver: charData.silver }),
          ...(charData.copper !== undefined && { copper: charData.copper }),
          ...(charData.deity !== undefined && { deity: charData.deity }),
          ...(charData.languages !== undefined && { languages: JSON.stringify(charData.languages) }),
          ...(charData.equipment !== undefined && { equipment: JSON.stringify(charData.equipment) }),
          ...(charData.spells !== undefined && { spells: JSON.stringify(charData.spells) }),
          ...(charData.talents !== undefined && { talents: JSON.stringify(charData.talents) }),
          ...(charData.features !== undefined && { features: JSON.stringify(charData.features) }),
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