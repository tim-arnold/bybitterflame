import { NextResponse } from "next/server";

/**
 * GET /api/campaign/[campaignId]
 * Load campaign data, character, and message history.
 * TODO: Wire up to D1 database. Currently returns empty defaults.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  const { campaignId } = await params;

  // TODO: Load from database
  return NextResponse.json({
    campaignId,
    character: {},
    campaign: {},
    sessionNumber: 1,
    messages: [],
  });
}
