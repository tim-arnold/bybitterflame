import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db/client";
import { characters, campaigns } from "@/lib/db/schema";
import { nanoid } from "nanoid";
import type { Character } from "@/lib/game/types";

export const runtime = "edge";

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
    };
    const { character, gmPersona } = body;

    if (!character.name || !character.ancestry || !character.class) {
      return NextResponse.json({ error: "Incomplete character data" }, { status: 400 });
    }

    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);

    const characterId = nanoid();
    const campaignId = nanoid();
    const now = new Date().toISOString();

    await db.insert(characters).values({
      id: characterId,
      name: character.name,
      pronouns: character.pronouns ?? "they/them",
      ancestry: character.ancestry,
      class: character.class,
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
      equipment: JSON.stringify(character.equipment ?? []),
      spells: JSON.stringify(character.spells ?? []),
      talents: JSON.stringify(character.talents ?? []),
      features: JSON.stringify(character.features ?? []),
      gold: character.gold ?? 0,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(campaigns).values({
      id: campaignId,
      characterId,
      name: `The Adventures of ${character.name}`,
      state: "active",
      gmPersona: gmPersona ?? "",
      worldState: JSON.stringify({
        currentLocation: "",
        visitedLocations: [],
        npcs: [],
        quests: [],
        flags: {},
      }),
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ characterId, campaignId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Character creation error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}