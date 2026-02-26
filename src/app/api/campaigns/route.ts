import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db/client";
import { characters, campaigns } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * GET /api/campaigns
 * List all active campaigns with their character and current location.
 */
export async function GET() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);

    const rows = await db
      .select({
        campaignId: campaigns.id,
        campaignName: campaigns.name,
        state: campaigns.state,
        worldState: campaigns.worldState,
        updatedAt: campaigns.updatedAt,
        characterName: characters.name,
        characterClass: characters.class,
        characterAncestry: characters.ancestry,
        characterLevel: characters.level,
        characterAlignment: characters.alignment,
      })
      .from(campaigns)
      .innerJoin(characters, eq(campaigns.characterId, characters.id))
      .where(eq(campaigns.state, "active"));

    const result = rows.map((row) => {
      const worldState = JSON.parse(row.worldState ?? "{}");
      return {
        campaignId: row.campaignId,
        campaignName: row.campaignName,
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