import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db/client";
import { users, campaigns, sessions, characters, authSessions, accounts, accountRequests } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";

export const runtime = "nodejs";

const ADMIN_EMAIL = "gm@bytorchlight.com";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await getSession(request);
  if (!session || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;

  // Prevent deleting the admin account
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const [target] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (target.email === ADMIN_EMAIL) {
    return NextResponse.json({ error: "Cannot delete the admin account" }, { status: 400 });
  }

  // 1. Find all campaigns for this user (collect character IDs)
  const userCampaigns = await db
    .select({ id: campaigns.id, characterId: campaigns.characterId })
    .from(campaigns)
    .where(eq(campaigns.userId, userId));

  const campaignIds = userCampaigns.map((c) => c.id);
  const characterIds = [...new Set(userCampaigns.map((c) => c.characterId))];

  // 2. Delete game sessions
  if (campaignIds.length > 0) {
    await db.delete(sessions).where(inArray(sessions.campaignId, campaignIds));
  }

  // 3. Delete campaigns
  await db.delete(campaigns).where(eq(campaigns.userId, userId));

  // 4. Delete characters
  if (characterIds.length > 0) {
    await db.delete(characters).where(inArray(characters.id, characterIds));
  }

  // 5. Delete auth sessions and accounts
  await db.delete(authSessions).where(eq(authSessions.userId, userId));
  await db.delete(accounts).where(eq(accounts.userId, userId));

  // 6. Delete account request (if any)
  await db.delete(accountRequests).where(eq(accountRequests.email, target.email));

  // 7. Delete the user
  await db.delete(users).where(eq(users.id, userId));

  return NextResponse.json({ ok: true });
}
