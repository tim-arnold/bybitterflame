import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db/client";
import { characters, campaigns } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { getAdventure } from "@/lib/adventures/index";

export const runtime = "nodejs";

/**
 * GET /api/characters
 * Returns all characters belonging to the authenticated user, with their
 * most recent campaign context. Also returns completed adventure IDs for badge rendering.
 */
export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ characters: [], completedAdventures: [] });
    }

    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);

    // Get all campaigns for this user with character data, ordered by recency
    const rows = await db
      .select({
        campaignId: campaigns.id,
        campaignState: campaigns.state,
        moduleId: campaigns.moduleId,
        adventureId: campaigns.adventureId,
        updatedAt: campaigns.updatedAt,
        characterId: characters.id,
        characterName: characters.name,
        characterClass: characters.class,
        characterAncestry: characters.ancestry,
        characterLevel: characters.level,
      })
      .from(campaigns)
      .innerJoin(characters, eq(campaigns.characterId, characters.id))
      .where(eq(campaigns.userId, session.user.id));

    // Collect completed adventures: adventureId → most recently completed character name
    const completedMap = new Map<string, { characterName: string; updatedAt: string }>();
    for (const r of rows) {
      if (r.campaignState === "completed" && r.adventureId) {
        const existing = completedMap.get(r.adventureId);
        if (!existing || r.updatedAt > existing.updatedAt) {
          completedMap.set(r.adventureId, {
            characterName: r.characterName ?? "Unknown",
            updatedAt: r.updatedAt,
          });
        }
      }
    }
    const completedAdventures = Array.from(completedMap.entries()).map(
      ([adventureId, { characterName }]) => ({ adventureId, characterName })
    );

    // Deduplicate characters: keep the most recently updated campaign per character
    const charMap = new Map<string, typeof rows[0]>();
    for (const row of rows) {
      const existing = charMap.get(row.characterId);
      if (!existing || row.updatedAt > existing.updatedAt) {
        charMap.set(row.characterId, row);
      }
    }

    const result = Array.from(charMap.values())
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((row) => {
        const adventure =
          row.moduleId && row.adventureId
            ? getAdventure(row.moduleId, row.adventureId)
            : undefined;
        return {
          id: row.characterId,
          name: row.characterName,
          class: row.characterClass,
          ancestry: row.characterAncestry,
          level: row.characterLevel,
          lastCampaignId: row.campaignId,
          lastCampaignState: row.campaignState,
          lastAdventureTitle: adventure?.title ?? null,
          lastAdventureId: row.adventureId ?? null,
          lastModuleId: row.moduleId ?? null,
          lastPlayedAt: row.updatedAt,
        };
      });

    return NextResponse.json({ characters: result, completedAdventures });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Characters list error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
