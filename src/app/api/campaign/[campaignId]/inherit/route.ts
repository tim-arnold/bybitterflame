import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db/client";
import { characters, campaigns } from "@/lib/db/schema";
import type { Companion, WorldState } from "@/lib/game/types";
import { getSession } from "@/lib/auth/session";

export const runtime = "nodejs";

/**
 * POST /api/campaign/[campaignId]/inherit
 * Soul transfer: create a new character from a companion and update the campaign.
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
      companion: Companion;
      legacyTalent?: string;
      deadCharacterName: string;
      deadCharacterLanguages?: string[];
      updatedWorldState: WorldState;
    };

    const { companion, legacyTalent, deadCharacterLanguages, updatedWorldState } = body;

    // Merge languages from both characters; companion's deity is kept as-is
    const mergedLanguages = [
      ...new Set([...(companion.languages ?? []), ...(deadCharacterLanguages ?? [])]),
    ];

    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);

    const [campaignRow] = await db
      .select({ userId: campaigns.userId })
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
    const newCharacterId = crypto.randomUUID();

    const talents = legacyTalent
      ? [...companion.talents, legacyTalent]
      : [...companion.talents];

    await db.insert(characters).values({
      id: newCharacterId,
      name: companion.name,
      pronouns: companion.pronouns,
      ancestry: companion.ancestry,
      class: companion.class,
      level: companion.level,
      xp: 0,
      alignment: companion.alignment,
      background: companion.background,
      str: companion.str,
      dex: companion.dex,
      con: companion.con,
      int: companion.int,
      wis: companion.wis,
      cha: companion.cha,
      // Fall back to maxHp if current HP was never tracked (0)
      hp: companion.hp > 0 ? companion.hp : (companion.maxHp || 1),
      maxHp: companion.maxHp || 1,
      ac: companion.ac,
      deity: companion.deity ?? "",
      languages: JSON.stringify(mergedLanguages),
      equipment: JSON.stringify(companion.equipment ?? []),
      spells: JSON.stringify(companion.spells ?? []),
      talents: JSON.stringify(talents),
      features: JSON.stringify([]),
      gold: 0,
      silver: 0,
      copper: 0,
      createdAt: now,
      updatedAt: now,
    });

    await db
      .update(campaigns)
      .set({
        characterId: newCharacterId,
        worldState: JSON.stringify(updatedWorldState),
        updatedAt: now,
      })
      .where(eq(campaigns.id, campaignId));

    return NextResponse.json({ newCharacterId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Inherit error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
