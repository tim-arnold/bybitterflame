import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/errors";
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

    // Get all characters owned by this user
    const userCharacters = await db
      .select()
      .from(characters)
      .where(eq(characters.userId, session.user.id));

    if (userCharacters.length === 0) {
      return NextResponse.json({ characters: [], completedAdventures: [] });
    }

    // Get all campaigns for these characters
    const rows = await db
      .select({
        campaignId: campaigns.id,
        campaignState: campaigns.state,
        moduleId: campaigns.moduleId,
        adventureId: campaigns.adventureId,
        updatedAt: campaigns.updatedAt,
        characterId: campaigns.characterId,
      })
      .from(campaigns)
      .where(eq(campaigns.userId, session.user.id));

    const charById = new Map(userCharacters.map((c) => [c.id, c]));

    // Track active/most-recent campaign per character
    const activeCharIds = new Set<string>();
    const latestCampaignMap = new Map<string, typeof rows[0]>();
    for (const row of rows) {
      if (row.campaignState === "active") activeCharIds.add(row.characterId);
      const existing = latestCampaignMap.get(row.characterId);
      if (!existing || row.updatedAt > existing.updatedAt) {
        latestCampaignMap.set(row.characterId, row);
      }
    }

    // Collect completed adventures: adventureId → most recently completed character name
    const completedMap = new Map<string, { characterName: string; updatedAt: string }>();
    for (const row of rows) {
      if (row.campaignState === "completed" && row.adventureId) {
        const char = charById.get(row.characterId);
        const existing = completedMap.get(row.adventureId);
        if (!existing || row.updatedAt > existing.updatedAt) {
          completedMap.set(row.adventureId, {
            characterName: char?.name ?? "Unknown",
            updatedAt: row.updatedAt,
          });
        }
      }
    }
    const completedAdventures = Array.from(completedMap.entries()).map(
      ([adventureId, { characterName }]) => ({ adventureId, characterName })
    );

    // Build result from all user characters (not just those with campaigns)
    const result = userCharacters
      .map((char) => {
        const latestCampaign = latestCampaignMap.get(char.id);
        const adventure =
          latestCampaign?.moduleId && latestCampaign?.adventureId
            ? getAdventure(latestCampaign.moduleId, latestCampaign.adventureId)
            : undefined;
        return {
          id: char.id,
          name: char.name,
          class: char.class,
          ancestry: char.ancestry,
          level: char.level,
          lastCampaignId: latestCampaign?.campaignId ?? null,
          lastCampaignState: latestCampaign?.campaignState ?? null,
          isAdventuring: activeCharIds.has(char.id),
          lastAdventureTitle: adventure?.title ?? null,
          lastAdventureId: latestCampaign?.adventureId ?? null,
          lastModuleId: latestCampaign?.moduleId ?? null,
          lastPlayedAt: latestCampaign?.updatedAt ?? char.updatedAt,
        };
      })
      .sort((a, b) => b.lastPlayedAt.localeCompare(a.lastPlayedAt));

    return NextResponse.json({ characters: result, completedAdventures });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Characters list error:", error);
    return apiError(message);
  }
}
