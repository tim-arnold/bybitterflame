import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db/client";
import { characters, campaigns, sessions } from "@/lib/db/schema";

export const runtime = "nodejs";

/**
 * GET /api/campaign/[campaignId]
 * Load campaign data, character, and message history.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  const { campaignId } = await params;

  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);

    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, campaignId))
      .limit(1);

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const [character] = await db
      .select()
      .from(characters)
      .where(eq(characters.id, campaign.characterId))
      .limit(1);

    if (!character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    const [session] = await db
      .select({ messages: sessions.messages, sessionNumber: sessions.sessionNumber })
      .from(sessions)
      .where(eq(sessions.campaignId, campaignId))
      .limit(1);

    return NextResponse.json({
      campaignId,
      character: {
        ...character,
        languages: JSON.parse(character.languages ?? "[]"),
        equipment: JSON.parse(character.equipment),
        spells: JSON.parse(character.spells),
        talents: JSON.parse(character.talents),
        features: JSON.parse(character.features),
      },
      campaign: {
        ...campaign,
        worldState: JSON.parse(campaign.worldState),
      },
      sessionNumber: session?.sessionNumber ?? 1,
      messages: session ? JSON.parse(session.messages) : [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Campaign load error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}