import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { desc, eq, not } from "drizzle-orm";
import { getAuth } from "@/lib/auth/index";
import { getDb } from "@/lib/db/client";
import { users, accountRequests } from "@/lib/db/schema";
import { SERVER_KEY_TURN_LIMIT, calcMixedCost } from "@/lib/config";
import { decryptApiKey, getEncryptionSecret } from "@/lib/crypto";
import { ADMIN_EMAIL } from "@/lib/auth/admin";
import { BetaKeyForm } from "./BetaKeyForm";
import { UserRow } from "./UserRow";
import { EmailBlastForm } from "./EmailBlastForm";

function maskKey(key: string): string {
  return `sk-ant-...••••••${key.slice(-4)}`;
}

function keyStatusBadge(user: {
  anthropicApiKey: string | null;
  betaApiKey: string | null;
  betaKeyMode: string | null;
  serverKeyTurnsUsed: number;
  serverKeyTurnsBonus: number;
}): React.ReactNode {
  if (user.anthropicApiKey) {
    return <span className="rounded px-2 py-0.5 text-xs font-mono bg-emerald-900/60 text-emerald-300 border border-emerald-700">Own Key</span>;
  }
  if (user.betaApiKey && user.betaKeyMode === "full") {
    return <span className="rounded px-2 py-0.5 text-xs font-mono bg-yellow-900/60 text-yellow-300 border border-yellow-700">Beta Key</span>;
  }
  const effectiveLimit = SERVER_KEY_TURN_LIMIT + (user.serverKeyTurnsBonus ?? 0);
  if (user.serverKeyTurnsUsed >= effectiveLimit) {
    return <span className="rounded px-2 py-0.5 text-xs font-mono bg-red-900/60 text-red-300 border border-red-700">Exhausted</span>;
  }
  return (
    <span className="rounded px-2 py-0.5 text-xs font-mono bg-blue-900/60 text-blue-300 border border-blue-700">
      Trial {user.serverKeyTurnsUsed}/{effectiveLimit}
    </span>
  );
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

function formatCost(
  totalIn: number, totalOut: number, totalWrite = 0, totalRead = 0,
  haikuIn = 0, haikuOut = 0, haikuWrite = 0, haikuRead = 0,
): string {
  return `$${calcMixedCost(totalIn, totalOut, totalWrite, totalRead, haikuIn, haikuOut, haikuWrite, haikuRead).toFixed(3)}`;
}

function formatDate(val: Date | number | null): string {
  if (!val) return "—";
  const d = val instanceof Date ? val : new Date(val * 1000);
  return d.toLocaleDateString();
}

export default async function AdminPage() {
  // ── Auth check ──────────────────────────────────────────────────────────────
  const auth = await getAuth();
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session || session.user.email !== ADMIN_EMAIL) {
    redirect("/");
  }

  // ── DB queries ──────────────────────────────────────────────────────────────
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const [allUsers, pendingRequests] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        anthropicApiKey: users.anthropicApiKey,
        betaApiKey: users.betaApiKey,
        betaKeyMode: users.betaKeyMode,
        serverKeyTurnsUsed: users.serverKeyTurnsUsed,
        serverKeyTurnsBonus: users.serverKeyTurnsBonus,
        totalInputTokens: users.totalInputTokens,
        totalOutputTokens: users.totalOutputTokens,
        totalCacheWriteTokens: users.totalCacheWriteTokens,
        totalCacheReadTokens: users.totalCacheReadTokens,
        ownKeyInputTokens: users.ownKeyInputTokens,
        ownKeyOutputTokens: users.ownKeyOutputTokens,
        ownKeyCacheWriteTokens: users.ownKeyCacheWriteTokens,
        ownKeyCacheReadTokens: users.ownKeyCacheReadTokens,
        haikuInputTokens: users.haikuInputTokens,
        haikuOutputTokens: users.haikuOutputTokens,
        haikuCacheWriteTokens: users.haikuCacheWriteTokens,
        haikuCacheReadTokens: users.haikuCacheReadTokens,
      })
      .from(users)
      .orderBy(desc(users.createdAt)),
    db
      .select()
      .from(accountRequests)
      .where(not(eq(accountRequests.status, "completed")))
      .orderBy(desc(accountRequests.createdAt)),
  ]);

  const secret = getEncryptionSecret(env.API_KEY_ENCRYPTION_SECRET);

  // Decrypt stored keys for display (masking) and status checks
  const decryptedUsers = await Promise.all(
    allUsers.map(async (u) => ({
      ...u,
      decryptedOwnKey: u.anthropicApiKey
        ? await decryptApiKey(u.anthropicApiKey, secret)
        : null,
      decryptedBetaKey: u.betaApiKey
        ? await decryptApiKey(u.betaApiKey, secret)
        : null,
    })),
  );
  const decryptedRequests = await Promise.all(
    pendingRequests.map(async (r) => ({
      ...r,
      decryptedBetaKey: r.betaApiKey
        ? await decryptApiKey(r.betaApiKey, secret)
        : null,
    })),
  );

  const totalUsers = allUsers.length;
  const totalPending = pendingRequests.length;

  return (
    <div className="relative min-h-screen text-stone-100">
      <div className="absolute inset-0 bg-[url('/bg-woodcut.webp')] bg-cover bg-center" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="text-xs text-stone-400 hover:text-white transition-colors">
            ← Home
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-[var(--color-gold)] mb-1">Admin</h1>
        <p className="text-stone-400 mb-8 text-sm">
          {totalUsers} user{totalUsers !== 1 ? "s" : ""}
          {totalPending > 0 && ` · ${totalPending} pending`}
        </p>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-stone-200 mb-3">Pending Requests</h2>
            <div className="rounded-lg border border-stone-700 bg-stone-950/80 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-700 text-xs text-stone-500 uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">Name / Email</th>
                    <th className="px-4 py-3 text-left">Requested</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Beta Key</th>
                    <th className="px-4 py-3 text-left"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {decryptedRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-stone-900/40 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-stone-100">{req.name}</p>
                        <p className="text-xs text-stone-400">{req.email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-stone-400 whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {req.status === "pending" ? (
                          <span className="rounded px-2 py-0.5 text-xs font-mono bg-stone-800 text-stone-400 border border-stone-700">
                            Pending
                          </span>
                        ) : (
                          <span className="rounded px-2 py-0.5 text-xs font-mono bg-amber-900/60 text-amber-300 border border-amber-700">
                            Approved
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <BetaKeyForm
                          endpoint={`/api/admin/requests/${req.id}/beta-key`}
                          initialMasked={req.decryptedBetaKey ? maskKey(req.decryptedBetaKey) : null}
                          initialMode={(req.betaKeyMode as "trial" | "full") ?? "trial"}
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {req.status === "pending" && (
                          <Link
                            href={`/api/account-request/approve?token=${req.token}`}
                            className="text-xs text-[var(--color-gold)] hover:text-yellow-300 transition-colors"
                          >
                            Approve →
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Email Blast */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-stone-200 mb-3">Email Blast</h2>
          <EmailBlastForm userCount={totalUsers} />
        </section>

        {/* Users Table */}
        <section>
          <h2 className="text-lg font-semibold text-stone-200 mb-3">Users</h2>
          <div className="rounded-lg border border-stone-700 bg-stone-950/80 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-700 text-xs text-stone-500 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Name / Email</th>
                  <th className="px-4 py-3 text-left">Joined</th>
                  <th className="px-4 py-3 text-left">Key Status</th>
                  <th className="px-4 py-3 text-right w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {decryptedUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={{
                      id: user.id,
                      name: user.name,
                      email: user.email,
                      joinedLabel: formatDate(user.createdAt),
                      keyStatusBadge: keyStatusBadge(user),
                      isAdmin: user.email === ADMIN_EMAIL,
                      anthropicApiKey: user.decryptedOwnKey,
                      betaApiKey: user.decryptedBetaKey,
                      betaApiKeyMasked: user.decryptedBetaKey ? maskKey(user.decryptedBetaKey) : null,
                      betaKeyMode: user.betaKeyMode,
                      serverKeyTurnsUsed: user.serverKeyTurnsUsed,
                      serverKeyTurnsBonus: user.serverKeyTurnsBonus ?? 0,
                      serverKeyTurnLimit: SERVER_KEY_TURN_LIMIT,
                      tokensLabel: `${formatTokens(user.totalInputTokens)} in / ${formatTokens(user.totalOutputTokens)} out`,
                      costLabel: formatCost(
                        user.totalInputTokens, user.totalOutputTokens, user.totalCacheWriteTokens, user.totalCacheReadTokens,
                        user.haikuInputTokens, user.haikuOutputTokens, user.haikuCacheWriteTokens, user.haikuCacheReadTokens,
                      ),
                      ownKeyTokensLabel: user.decryptedOwnKey
                        ? `${formatTokens(user.ownKeyInputTokens)} in / ${formatTokens(user.ownKeyOutputTokens)} out`
                        : null,
                      ownKeyCostLabel: user.decryptedOwnKey
                        ? formatCost(user.ownKeyInputTokens, user.ownKeyOutputTokens, user.ownKeyCacheWriteTokens, user.ownKeyCacheReadTokens)
                        : null,
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
