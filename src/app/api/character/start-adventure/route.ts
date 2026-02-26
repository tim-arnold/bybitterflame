import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db/client";
import { campaigns } from "@/lib/db/schema";

export const runtime = "nodejs";

/**
 * POST /api/character/start-adventure
 * Create a new campaign for an existing character to play a specific adventure module.
 * Copies the character reference from the source campaign.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      sourceCampaignId: string;
      moduleId: string;
      adventureId: string;
    };
    const { sourceCampaignId, moduleId, adventureId } = body;

    if (!sourceCampaignId || !moduleId || !adventureId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);

    // Look up the source campaign to get the characterId
    const [sourceCampaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, sourceCampaignId))
      .limit(1);

    if (!sourceCampaign) {
      return NextResponse.json({ error: "Source campaign not found" }, { status: 404 });
    }

    const campaignId = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.insert(campaigns).values({
      id: campaignId,
      characterId: sourceCampaign.characterId,
      name: sourceCampaign.name,
      state: "active",
      gmPersona: sourceCampaign.gmPersona ?? "",
      worldState: JSON.stringify({
        currentLocation: "",
        visitedLocations: [],
        npcs: [],
        quests: [],
        flags: {},
      }),
      campaignType: "oneshot",
      moduleId,
      adventureId,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ campaignId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Start adventure error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
