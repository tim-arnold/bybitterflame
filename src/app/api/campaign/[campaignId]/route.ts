import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db/client";
import { characters, campaigns, sessions } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";

export const runtime = "nodejs";

/**
 * GET /api/campaign/[campaignId]
 * Load campaign data, character, and message history.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  const { campaignId } = await params;

  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    if (campaign.userId && campaign.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [character] = await db
      .select()
      .from(characters)
      .where(eq(characters.id, campaign.characterId))
      .limit(1);

    if (!character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    const [gameSession] = await db
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
        campaignType: campaign.campaignType ?? "standard",
        moduleId: campaign.moduleId ?? null,
        adventureId: campaign.adventureId ?? null,
      },
      sessionNumber: gameSession?.sessionNumber ?? 1,
      messages: gameSession ? JSON.parse(gameSession.messages) : [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Campaign load error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/campaign/[campaignId]?target=adventure|character|both
 * Delete a campaign and optionally its character.
 *
 * target=adventure  — deletes sessions + campaign; character row survives for reuse
 * target=character  — deletes sessions + campaign + character
 * target=both       — same as "character"
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  const { campaignId } = await params;
  const url = new URL(request.url);
  const target = url.searchParams.get("target") ?? "adventure";

  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);

    const [campaign] = await db
      .select({ characterId: campaigns.characterId, userId: campaigns.userId })
      .from(campaigns)
      .where(eq(campaigns.id, campaignId))
      .limit(1);

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.userId && campaign.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete in FK-safe order: sessions → campaign → (optionally) character
    await db.delete(sessions).where(eq(sessions.campaignId, campaignId));
    await db.delete(campaigns).where(eq(campaigns.id, campaignId));

    if (target === "character" || target === "both") {
      await db.delete(characters).where(eq(characters.id, campaign.characterId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Campaign delete error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}