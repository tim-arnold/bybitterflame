import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db/client";
import { campaigns, characters } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import type { Companion } from "@/lib/game/types";

export const runtime = "nodejs";

/**
 * POST /api/companion/promote
 * Promotes a former companion (worldState-only) into a full characters row,
 * then creates a new campaign for them with the given adventure.
 *
 * Body: { companion: Companion; moduleId: string; adventureId: string; }
 * Returns: { campaignId: string }
 */
export async function POST(request: Request) {
  try {
    const session = await getSession(request);

    const body = await request.json() as {
      companion: Companion;
      moduleId: string;
      adventureId: string;
    };
    const { companion, moduleId, adventureId } = body;

    if (!companion || !moduleId || !adventureId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);

    const now = new Date().toISOString();

    // Create a characters row from the companion's stats
    const characterId = crypto.randomUUID();
    await db.insert(characters).values({
      id: characterId,
      name: companion.name,
      pronouns: companion.pronouns ?? "they/them",
      ancestry: companion.ancestry,
      class: companion.class,
      level: companion.level,
      xp: 0,
      alignment: companion.alignment ?? "Neutral",
      background: companion.background ?? "",
      str: companion.str,
      dex: companion.dex,
      con: companion.con,
      int: companion.int,
      wis: companion.wis,
      cha: companion.cha,
      // Restore to full HP
      hp: companion.maxHp,
      maxHp: companion.maxHp,
      ac: companion.ac,
      deity: companion.deity ?? "",
      languages: JSON.stringify(companion.languages ?? []),
      equipment: JSON.stringify(companion.equipment ?? []),
      spells: JSON.stringify(companion.spells ?? []),
      talents: JSON.stringify(companion.talents ?? []),
      features: JSON.stringify([]),
      gold: 0,
      silver: 0,
      copper: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Inherit gmPersona from the most recent campaign that features this companion's name.
    // Since the companion came from worldState (not a characters row), we can't easily
    // look it up by id. Fall back to empty string.
    let gmPersona = "";
    const [recentCampaign] = await db
      .select({ gmPersona: campaigns.gmPersona })
      .from(campaigns)
      .orderBy(desc(campaigns.updatedAt))
      .where(eq(campaigns.userId, session?.user.id ?? ""))
      .limit(1);
    if (recentCampaign) {
      gmPersona = recentCampaign.gmPersona ?? "";
    }

    const campaignId = crypto.randomUUID();
    await db.insert(campaigns).values({
      id: campaignId,
      userId: session?.user.id ?? null,
      characterId,
      name: companion.name,
      state: "active",
      gmPersona,
      worldState: JSON.stringify({
        currentLocation: "",
        visitedLocations: [],
        npcs: [],
        quests: [],
        companions: [],
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
    console.error("Companion promote error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
