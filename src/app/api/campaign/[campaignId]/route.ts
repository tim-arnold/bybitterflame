import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/errors";
import { eq, desc, count } from "drizzle-orm";
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
      return apiError("Unauthorized", 401);
    }

    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);

    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, campaignId))
      .limit(1);

    if (!campaign) {
      return apiError("Campaign not found", 404);
    }

    if (campaign.userId && campaign.userId !== session.user.id) {
      return apiError("Forbidden", 403);
    }

    const [character] = await db
      .select()
      .from(characters)
      .where(eq(characters.id, campaign.characterId))
      .limit(1);

    if (!character) {
      return apiError("Character not found", 404);
    }

    // Load all sessions ordered by number — newest last
    const allSessions = await db
      .select({ messages: sessions.messages, sessionNumber: sessions.sessionNumber, summary: sessions.summary })
      .from(sessions)
      .where(eq(sessions.campaignId, campaignId))
      .orderBy(desc(sessions.sessionNumber));

    // Most recent session (highest sessionNumber) = current active session
    const currentSession = allSessions[0];
    // Past sessions = all but the current; only include those with a summary
    const pastSessions = allSessions.slice(1).reverse(); // chronological order
    const sessionSummaries = pastSessions
      .filter((s) => s.summary)
      .slice(-5) // at most 5 past summaries
      .map((s) => s.summary as string);

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
        gmNotes: campaign.gmNotes ?? null,
        worldState: JSON.parse(campaign.worldState),
        campaignType: campaign.campaignType ?? "standard",
        moduleId: campaign.moduleId ?? null,
        adventureId: campaign.adventureId ?? null,
      },
      sessionNumber: currentSession?.sessionNumber ?? 1,
      messages: currentSession ? JSON.parse(currentSession.messages) : [],
      sessionSummaries,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Campaign load error:", error);
    return apiError(message);
  }
}

/**
 * DELETE /api/campaign/[campaignId]
 * Deletes sessions + campaign. The character row is preserved for reuse.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  const { campaignId } = await params;

  try {
    const session = await getSession(request);
    if (!session) {
      return apiError("Unauthorized", 401);
    }

    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);

    const body = await request.json().catch(() => ({})) as { deleteCharacter?: boolean };
    const shouldDeleteCharacter = body.deleteCharacter === true;

    const [campaign] = await db
      .select({ characterId: campaigns.characterId, userId: campaigns.userId })
      .from(campaigns)
      .where(eq(campaigns.id, campaignId))
      .limit(1);

    if (!campaign) {
      return apiError("Campaign not found", 404);
    }

    if (campaign.userId && campaign.userId !== session.user.id) {
      return apiError("Forbidden", 403);
    }

    // Delete in FK-safe order: sessions → campaign; optionally delete character
    await db.delete(sessions).where(eq(sessions.campaignId, campaignId));
    await db.delete(campaigns).where(eq(campaigns.id, campaignId));

    if (shouldDeleteCharacter && campaign.characterId) {
      // Safety check: only delete if no other campaigns reference this character
      const [{ remaining }] = await db
        .select({ remaining: count() })
        .from(campaigns)
        .where(eq(campaigns.characterId, campaign.characterId));

      if (remaining === 0) {
        await db.delete(characters).where(eq(characters.id, campaign.characterId));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Campaign delete error:", error);
    return apiError(message);
  }
}