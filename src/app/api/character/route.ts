import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/errors";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db/client";
import { characters, campaigns } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import type { Character, Companion } from "@/lib/game/types";

export const runtime = "nodejs";

/**
 * POST /api/character
 * Save a completed character and create a new campaign.
 * Called at the end of character creation.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      character: Partial<Character>;
      gmPersona: string;
      campaignType?: "standard" | "oneshot";
      moduleId?: string;
      adventureId?: string;
      companions?: Companion[];
    };
    const { character, gmPersona, campaignType, moduleId, adventureId, companions } = body;

    // GM-create mode starts with an empty placeholder — the GM fills in the character
    const isGmCreate = !character.name;
    if (!isGmCreate && (!character.name || !character.ancestry || !character.class)) {
      return apiError("Incomplete character data", 400);
    }

    const session = await getSession(request);

    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);

    const characterId = crypto.randomUUID();
    const campaignId = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.insert(characters).values({
      id: characterId,
      userId: session?.user.id ?? null,
      name: character.name ?? "",
      pronouns: character.pronouns ?? "they/them",
      ancestry: character.ancestry ?? "",
      class: character.class ?? "",
      level: character.level ?? 1,
      xp: character.xp ?? 0,
      alignment: character.alignment ?? "Neutral",
      background: character.background ?? "",
      str: character.str ?? 10,
      dex: character.dex ?? 10,
      con: character.con ?? 10,
      int: character.int ?? 10,
      wis: character.wis ?? 10,
      cha: character.cha ?? 10,
      hp: character.hp ?? 1,
      maxHp: character.maxHp ?? character.hp ?? 1,
      ac: character.ac ?? 10,
      specialization: character.specialization ?? null,
      toll: character.toll ?? 0,
      tollPermanent: character.tollPermanent ?? 0,
      deity: character.deity ?? "",
      languages: JSON.stringify(character.languages ?? []),
      equipment: JSON.stringify(character.equipment ?? []),
      spells: JSON.stringify(character.spells ?? []),
      talents: JSON.stringify(character.talents ?? []),
      features: JSON.stringify(character.features ?? []),
      gold: character.gold ?? 0,
      silver: character.silver ?? 0,
      copper: character.copper ?? 0,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(campaigns).values({
      id: campaignId,
      userId: session?.user.id ?? null,
      characterId,
      name: character.name ? `The Adventures of ${character.name}` : "New Adventure",
      state: "active",
      gmPersona: gmPersona ?? "",
      worldState: JSON.stringify({
        currentLocation: "",
        visitedLocations: [],
        npcs: [],
        quests: [],
        flags: {},
        ...(companions && companions.length > 0 && {
          companions: companions.map((c) => ({ ...c, hp: c.maxHp })),
        }),
      }),
      campaignType: campaignType ?? "standard",
      moduleId: moduleId ?? null,
      adventureId: adventureId ?? null,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ characterId, campaignId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Character creation error:", error);
    return apiError(message);
  }
}