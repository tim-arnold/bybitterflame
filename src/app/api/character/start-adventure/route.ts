import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/errors";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db/client";
import { campaigns, characters } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import type { Companion } from "@/lib/game/types";

const startAdventureSchema = z.object({
  sourceCampaignId: z.string().uuid().optional(),
  characterId: z.string().uuid().optional(),
  moduleId: z.string().max(100).optional(),
  adventureId: z.string().max(100).optional(),
  campaignType: z.enum(["standard", "oneshot"]).optional(),
  companions: z.array(z.record(z.string(), z.unknown())).max(20).optional(),
});

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

    const parsed = startAdventureSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError("Invalid request body", 400);
    }
    const { sourceCampaignId, characterId: directCharacterId, moduleId, adventureId, campaignType, companions } = parsed.data;

    if (!sourceCampaignId && !directCharacterId) {
      return apiError("Missing required fields", 400);
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
        return apiError("Source campaign not found", 404);
      }

      if (sourceCampaign.userId && sourceCampaign.userId !== session?.user.id) {
        return apiError("Forbidden", 403);
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
        return apiError("Character not found", 404);
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
    const initialCompanions: Companion[] = (companions ?? []).map((c) => {
      const comp = c as unknown as Companion;
      return { ...comp, hp: comp.maxHp };
    });

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
      campaignType: campaignType ?? (moduleId ? "oneshot" : "standard"),
      moduleId: moduleId ?? null,
      adventureId: adventureId ?? null,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ campaignId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Start adventure error:", error);
    return apiError(message);
  }
}
