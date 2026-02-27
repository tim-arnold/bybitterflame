import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db/client";
import { characters, campaigns } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { getAdventure } from "@/lib/adventures/index";
import { getSession } from "@/lib/auth/session";

export const runtime = "nodejs";

/**
 * GET /api/campaigns
 * List all active campaigns with their character and current location.
 */
export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);

    const userFilter = session
      ? eq(campaigns.userId, session.user.id)
      : isNull(campaigns.userId);

    const rows = await db
      .select({
        campaignId: campaigns.id,
        campaignName: campaigns.name,
        state: campaigns.state,
        worldState: campaigns.worldState,
        updatedAt: campaigns.updatedAt,
        moduleId: campaigns.moduleId,
        adventureId: campaigns.adventureId,
        characterName: characters.name,
        characterClass: characters.class,
        characterAncestry: characters.ancestry,
        characterLevel: characters.level,
        characterAlignment: characters.alignment,
      })
      .from(campaigns)
      .innerJoin(characters, eq(campaigns.characterId, characters.id))
      .where(and(eq(campaigns.state, "active"), userFilter));

    const result = rows.map((row) => {
      const worldState = JSON.parse(row.worldState ?? "{}");
      const adventure =
        row.moduleId && row.adventureId
          ? getAdventure(row.moduleId, row.adventureId)
          : undefined;
      return {
        campaignId: row.campaignId,
        campaignName: adventure ? adventure.title : row.campaignName,
        updatedAt: row.updatedAt,
        currentLocation: worldState.currentLocation ?? "",
        character: {
          name: row.characterName,
          class: row.characterClass,
          ancestry: row.characterAncestry,
          level: row.characterLevel,
          alignment: row.characterAlignment,
        },
      };
    });

    return NextResponse.json({ campaigns: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Campaigns list error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}