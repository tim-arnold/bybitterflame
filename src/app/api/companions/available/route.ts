import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/errors";
import { eq, ne, and } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db/client";
import { campaigns, characters } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { getAdventure } from "@/lib/adventures/index";
import type { Companion } from "@/lib/game/types";

export const runtime = "nodejs";

/**
 * GET /api/companions/available?characterId=X
 * Returns:
 *  - formerCompanions: companions from completed/abandoned campaigns for characterId
 *    (alive, not hostile), deduplicated by name, with lastSeenIn adventure title
 *  - availableCharacters: roster characters not in active campaigns (excluding characterId),
 *    with full stats
 */
export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ formerCompanions: [], availableCharacters: [] });
    }

    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get("characterId"); // optional — omit for GM-create path

    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);

    // --- Former companions ---
    // Only available when a characterId is provided (existing character path).
    // GM-create has no character yet, so former companions are not applicable.
    let formerCompanions: { companion: Companion; lastSeenIn: string | null }[] = [];

    if (characterId) {
      const pastCampaigns = await db
        .select({
          id: campaigns.id,
          state: campaigns.state,
          worldState: campaigns.worldState,
          moduleId: campaigns.moduleId,
          adventureId: campaigns.adventureId,
          updatedAt: campaigns.updatedAt,
        })
        .from(campaigns)
        .where(eq(campaigns.characterId, characterId));

      const companionMap = new Map<string, { companion: Companion; lastSeenIn: string | null; updatedAt: string }>();

      for (const campaign of pastCampaigns) {
        if (campaign.state === "active") continue;

        let worldState: { companions?: Companion[] };
        try {
          worldState = JSON.parse(campaign.worldState ?? "{}");
        } catch {
          continue;
        }

        const adventureTitle =
          campaign.moduleId && campaign.adventureId
            ? getAdventure(campaign.moduleId, campaign.adventureId)?.title ?? null
            : null;

        for (const companion of worldState.companions ?? []) {
          if (companion.status === "dead" || companion.status === "hostile") continue;

          const existing = companionMap.get(companion.name);
          if (!existing || campaign.updatedAt > existing.updatedAt) {
            companionMap.set(companion.name, {
              companion,
              lastSeenIn: adventureTitle,
              updatedAt: campaign.updatedAt,
            });
          }
        }
      }

      formerCompanions = Array.from(companionMap.values()).map(({ companion, lastSeenIn }) => ({
        companion,
        lastSeenIn,
      }));
    }

    // --- Available roster characters ---
    // All characters belonging to this user, except the selected one (if any)
    const allChars = characterId
      ? await db.select().from(characters).where(and(eq(characters.userId, session.user.id), ne(characters.id, characterId)))
      : await db.select().from(characters).where(eq(characters.userId, session.user.id));

    // Determine which characters are busy (have an active campaign)
    const activeCampaigns = await db
      .select({ characterId: campaigns.characterId })
      .from(campaigns)
      .where(eq(campaigns.state, "active"));

    const busyCharacterIds = new Set(activeCampaigns.map((c) => c.characterId));

    // Get last adventure title per character for display
    const allCharCampaigns = await db
      .select({
        characterId: campaigns.characterId,
        moduleId: campaigns.moduleId,
        adventureId: campaigns.adventureId,
        updatedAt: campaigns.updatedAt,
      })
      .from(campaigns);

    const lastAdventureMap = new Map<
      string,
      { moduleId: string | null; adventureId: string | null; updatedAt: string }
    >();
    for (const c of allCharCampaigns) {
      const existing = lastAdventureMap.get(c.characterId);
      if (!existing || c.updatedAt > existing.updatedAt) {
        lastAdventureMap.set(c.characterId, {
          moduleId: c.moduleId ?? null,
          adventureId: c.adventureId ?? null,
          updatedAt: c.updatedAt,
        });
      }
    }

    const availableCharacters = allChars
      .filter((char) => !busyCharacterIds.has(char.id))
      .map((char) => {
        const lastAdv = lastAdventureMap.get(char.id);
        const lastAdventureTitle =
          lastAdv?.moduleId && lastAdv?.adventureId
            ? getAdventure(lastAdv.moduleId, lastAdv.adventureId)?.title ?? null
            : null;

        let equipment: unknown[] = [];
        let spells: unknown[] = [];
        let talents: string[] = [];
        try { equipment = JSON.parse(char.equipment ?? "[]"); } catch { /* ignore */ }
        try { spells = JSON.parse(char.spells ?? "[]"); } catch { /* ignore */ }
        try { talents = JSON.parse(char.talents ?? "[]"); } catch { /* ignore */ }

        return {
          id: char.id,
          name: char.name,
          class: char.class,
          ancestry: char.ancestry,
          level: char.level,
          str: char.str,
          dex: char.dex,
          con: char.con,
          int: char.int,
          wis: char.wis,
          cha: char.cha,
          hp: char.hp,
          maxHp: char.maxHp,
          ac: char.ac,
          equipment,
          spells,
          talents,
          lastAdventureTitle,
        };
      });

    return NextResponse.json({ formerCompanions, availableCharacters });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Companions available error:", error);
    return apiError(message);
  }
}
