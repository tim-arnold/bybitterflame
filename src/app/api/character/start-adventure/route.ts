import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db/client";
import { campaigns, characters } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import type { Companion } from "@/lib/game/types";

export const runtime = "nodejs";

/**
 * POST /api/character/start-adventure
 * Create a new campaign for an existing character to play a specific adventure module.
 * Accepts either sourceCampaignId (copies character from that campaign) or
 * characterId directly (looks up character, inherits most recent gmPersona).
 */
export async function POST(request: Request) {
  try {
    const session = await getSession(request);

    const body = await request.json() as {
      sourceCampaignId?: string;
      characterId?: string;
      moduleId: string;
      adventureId: string;
      companions?: Companion[];
    };
    const { sourceCampaignId, characterId: directCharacterId, moduleId, adventureId, companions } = body;

    if ((!sourceCampaignId && !directCharacterId) || !moduleId || !adventureId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);

    let resolvedCharacterId: string;
    let campaignName: string;
    let gmPersona = "";

    if (sourceCampaignId) {
      // Path A: copy from source campaign
      const [sourceCampaign] = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.id, sourceCampaignId))
        .limit(1);

      if (!sourceCampaign) {
        return NextResponse.json({ error: "Source campaign not found" }, { status: 404 });
      }

      resolvedCharacterId = sourceCampaign.characterId;
      campaignName = sourceCampaign.name;
      gmPersona = sourceCampaign.gmPersona ?? "";
    } else {
      // Path B: direct characterId
      const [character] = await db
        .select()
        .from(characters)
        .where(eq(characters.id, directCharacterId!))
        .limit(1);

      if (!character) {
        return NextResponse.json({ error: "Character not found" }, { status: 404 });
      }

      resolvedCharacterId = character.id;
      campaignName = character.name;

      // Inherit gmPersona from most recent campaign for this character
      const [recentCampaign] = await db
        .select({ gmPersona: campaigns.gmPersona })
        .from(campaigns)
        .where(eq(campaigns.characterId, character.id))
        .orderBy(desc(campaigns.updatedAt))
        .limit(1);

      if (recentCampaign) {
        gmPersona = recentCampaign.gmPersona ?? "";
      }
    }

    const campaignId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Build initial companions list — restore each companion's HP to max
    const initialCompanions: Companion[] = (companions ?? []).map((c) => ({ ...c, hp: c.maxHp }));

    await db.insert(campaigns).values({
      id: campaignId,
      userId: session?.user.id ?? null,
      characterId: resolvedCharacterId,
      name: campaignName,
      state: "active",
      gmPersona,
      worldState: JSON.stringify({
        currentLocation: "",
        visitedLocations: [],
        npcs: [],
        quests: [],
        companions: initialCompanions,
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
