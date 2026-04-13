import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/errors";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db/client";
import { campaigns } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";

export const runtime = "nodejs";

/**
 * POST /api/campaign/[campaignId]/complete
 * Mark a campaign as completed. Called when the GM emits an adventureComplete gamestate.
 */
export async function POST(
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
      .select({ userId: campaigns.userId })
      .from(campaigns)
      .where(eq(campaigns.id, campaignId))
      .limit(1);

    if (!campaign) {
      return apiError("Campaign not found", 404);
    }

    if (campaign.userId && campaign.userId !== session.user.id) {
      return apiError("Forbidden", 403);
    }

    await db
      .update(campaigns)
      .set({ state: "completed" })
      .where(eq(campaigns.id, campaignId));

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Internal server error");
  }
}
