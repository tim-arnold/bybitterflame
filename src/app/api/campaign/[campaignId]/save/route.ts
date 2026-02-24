import { NextResponse } from "next/server";

/**
 * POST /api/campaign/[campaignId]/save
 * Persist campaign state, character data, and messages.
 * TODO: Wire up to D1 database.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  const { campaignId } = await params;
  const body = await request.json();

  // TODO: Save to database
  console.log(`Saving campaign ${campaignId}:`, {
    character: !!body.character,
    campaign: !!body.campaign,
    messages: body.messages?.length ?? 0,
    sessionNumber: body.sessionNumber,
  });

  return NextResponse.json({ success: true, campaignId });
}
