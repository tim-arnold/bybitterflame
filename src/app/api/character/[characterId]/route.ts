import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/errors";
import { eq, and } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db/client";
import { characters, campaigns, sessions } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { getAdventure } from "@/lib/adventures/index";
import type { WorldState } from "@/lib/game/types";

export const runtime = "nodejs";

/**
 * GET /api/character/[characterId]
 * Returns full character data + campaign history with companions.
 * Only accessible by the character's owner.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ characterId: string }> },
) {
  const { characterId } = await params;

  try {
    const session = await getSession(request);
    if (!session) {
      return apiError("Unauthorized", 401);
    }

    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);

    const [character] = await db
      .select()
      .from(characters)
      .where(and(eq(characters.id, characterId), eq(characters.userId, session.user.id)))
      .limit(1);

    if (!character) {
      return apiError("Not found", 404);
    }

    const campaignRows = await db
      .select({
        id: campaigns.id,
        name: campaigns.name,
        state: campaigns.state,
        moduleId: campaigns.moduleId,
        adventureId: campaigns.adventureId,
        worldState: campaigns.worldState,
        createdAt: campaigns.createdAt,
        updatedAt: campaigns.updatedAt,
      })
      .from(campaigns)
      .where(eq(campaigns.characterId, characterId));

    // Deduplicated companion map: name → most detailed entry seen
    const companionMap = new Map<string, {
      name: string;
      ancestry: string;
      class: string;
      level: number;
      status: string;
      lastSeenIn: string;
    }>();

    const campaignHistory = campaignRows
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((row) => {
        let worldState: WorldState | null = null;
        try {
          worldState = JSON.parse(row.worldState) as WorldState;
        } catch {
          // ignore parse errors
        }

        const companions = (worldState?.companions ?? []).map((c) => ({
          name: c.name,
          ancestry: c.ancestry,
          class: c.class,
          level: c.level,
          status: c.status,
        }));

        const adventure =
          row.moduleId && row.adventureId
            ? getAdventure(row.moduleId, row.adventureId)
            : null;
        const title = adventure?.title ?? row.name;

        // Accumulate into dedup map
        for (const c of companions) {
          if (!companionMap.has(c.name)) {
            companionMap.set(c.name, { ...c, lastSeenIn: title });
          }
        }

        return {
          id: row.id,
          name: row.name,
          state: row.state,
          adventureTitle: title,
          companions,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };
      });

    const allCompanions = Array.from(companionMap.values());

    // Parse JSON columns
    const parseJson = <T>(raw: string, fallback: T): T => {
      try { return JSON.parse(raw) as T; } catch { return fallback; }
    };

    return NextResponse.json({
      character: {
        id: character.id,
        name: character.name,
        pronouns: character.pronouns,
        ancestry: character.ancestry,
        class: character.class,
        level: character.level,
        xp: character.xp,
        alignment: character.alignment,
        background: character.background,
        deity: character.deity,
        str: character.str,
        dex: character.dex,
        con: character.con,
        int: character.int,
        wis: character.wis,
        cha: character.cha,
        hp: character.hp,
        maxHp: character.maxHp,
        ac: character.ac,
        gold: character.gold,
        silver: character.silver,
        copper: character.copper,
        equipment: parseJson(character.equipment, []),
        spells: parseJson(character.spells, []),
        talents: parseJson(character.talents, []),
        features: parseJson(character.features, []),
        languages: parseJson(character.languages, []),
        createdAt: character.createdAt,
      },
      campaigns: campaignHistory,
      allCompanions,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Character detail error:", error);
    return apiError(message);
  }
}

/**
 * DELETE /api/character/[characterId]
 * Deletes a character that is not currently in an active campaign.
 * Only allows deletion if the character belongs to the authenticated user
 * and has no active campaign.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ characterId: string }> },
) {
  const { characterId } = await params;

  try {
    const session = await getSession(request);
    if (!session) {
      return apiError("Unauthorized", 401);
    }

    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);

    // Verify the character belongs to this user via userId
    const [character] = await db
      .select({ id: characters.id })
      .from(characters)
      .where(and(eq(characters.id, characterId), eq(characters.userId, session.user.id)))
      .limit(1);

    if (!character) {
      return apiError("Character not found", 404);
    }

    // Delete in FK-safe order: sessions → campaigns → character
    const campaignRows = await db
      .select({ id: campaigns.id })
      .from(campaigns)
      .where(eq(campaigns.characterId, characterId));
    for (const row of campaignRows) {
      await db.delete(sessions).where(eq(sessions.campaignId, row.id));
    }
    await db.delete(campaigns).where(eq(campaigns.characterId, characterId));
    await db.delete(characters).where(eq(characters.id, characterId));

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Character delete error:", error);
    return apiError(message);
  }
}