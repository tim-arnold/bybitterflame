import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { desc, eq, not } from "drizzle-orm";
import { getAuth } from "@/lib/auth/index";
import { getDb } from "@/lib/db/client";
import { users, accountRequests } from "@/lib/db/schema";
import { SERVER_KEY_TURN_LIMIT, calcCost } from "@/lib/config";
import { BetaKeyForm } from "./BetaKeyForm";
import { DeleteUserButton } from "./DeleteUserButton";

const ADMIN_EMAIL = "gm@bytorchlight.com";

function maskKey(key: string): string {
  return `sk-ant-...••••••${key.slice(-4)}`;
}

function keyStatusBadge(user: {
  anthropicApiKey: string | null;
  betaApiKey: string | null;
  betaKeyMode: string | null;
  serverKeyTurnsUsed: number;
}) {
  if (user.anthropicApiKey) {
    return (
      <div className="space-y-1">
        <span className="rounded px-2 py-0.5 text-xs font-mono bg-emerald-900/60 text-emerald-300 border border-emerald-700">Own Key</span>
        <p className="text-xs text-stone-500 font-mono">{maskKey(user.anthropicApiKey)}</p>
      </div>
    );
  }
  if (user.betaApiKey && user.betaKeyMode === "full") {
    return <span className="rounded px-2 py-0.5 text-xs font-mono bg-yellow-900/60 text-yellow-300 border border-yellow-700">Beta Key</span>;
  }
  if (user.serverKeyTurnsUsed >= SERVER_KEY_TURN_LIMIT) {
    return <span className="rounded px-2 py-0.5 text-xs font-mono bg-red-900/60 text-red-300 border border-red-700">Exhausted</span>;
  }
  return (
    <span className="rounded px-2 py-0.5 text-xs font-mono bg-blue-900/60 text-blue-300 border border-blue-700">
      Trial {user.serverKeyTurnsUsed}/{SERVER_KEY_TURN_LIMIT}
    </span>
  );
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

function formatCost(input: number, output: number, cacheWrite = 0, cacheRead = 0): string {
  return `$${calcCost(input, output, cacheWrite, cacheRead).toFixed(3)}`;
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
        totalInputTokens: users.totalInputTokens,
        totalOutputTokens: users.totalOutputTokens,
        totalCacheWriteTokens: users.totalCacheWriteTokens,
        totalCacheReadTokens: users.totalCacheReadTokens,
        ownKeyInputTokens: users.ownKeyInputTokens,
        ownKeyOutputTokens: users.ownKeyOutputTokens,
      })
      .from(users)
      .orderBy(desc(users.createdAt)),
    db
      .select()
      .from(accountRequests)
      .where(not(eq(accountRequests.status, "completed")))
      .orderBy(desc(accountRequests.createdAt)),
  ]);

  const totalUsers = allUsers.length;
  const totalPending = pendingRequests.length;

  return (
    <div className="relative min-h-screen text-stone-100">
      <div className="absolute inset-0 bg-[url('/dungeon-background-rattail.webp')] bg-cover bg-center" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
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
                  {pendingRequests.map((req) => (
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
                          initialMasked={req.betaApiKey ? maskKey(req.betaApiKey) : null}
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

        {/* Users Table */}
        <section>
          <h2 className="text-lg font-semibold text-stone-200 mb-3">Users</h2>
          <div className="rounded-lg border border-stone-700 bg-stone-950/80 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-700 text-xs text-stone-500 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Name / Email</th>
                  <th className="px-4 py-3 text-left">Joined</th>
                  <th className="px-4 py-3 text-left">Key Status</th>
                  <th className="px-4 py-3 text-left">Tokens / Est. Cost</th>
                  <th className="px-4 py-3 text-left">Own Key Usage</th>
                  <th className="px-4 py-3 text-left">Beta Key</th>
                  <th className="px-4 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {allUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-stone-900/40 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-stone-100">{user.name}</p>
                      <p className="text-xs text-stone-400">{user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-400 whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {keyStatusBadge(user)}
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-400 whitespace-nowrap">
                      <span>{formatTokens(user.totalInputTokens)} in / {formatTokens(user.totalOutputTokens)} out</span>
                      <br />
                      <span className="text-stone-500">{formatCost(user.totalInputTokens, user.totalOutputTokens, user.totalCacheWriteTokens, user.totalCacheReadTokens)}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-400 whitespace-nowrap">
                      {user.anthropicApiKey ? (
                        <>
                          <span>{formatTokens(user.ownKeyInputTokens)} in / {formatTokens(user.ownKeyOutputTokens)} out</span>
                          <br />
                          <span className="text-stone-500">{formatCost(user.ownKeyInputTokens, user.ownKeyOutputTokens)}</span>
                        </>
                      ) : (
                        <span className="text-stone-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <BetaKeyForm
                        endpoint={`/api/admin/users/${user.id}/beta-key`}
                        initialMasked={user.betaApiKey ? maskKey(user.betaApiKey) : null}
                        initialMode={(user.betaKeyMode as "trial" | "full") ?? null}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {user.email !== ADMIN_EMAIL && (
                        <DeleteUserButton userId={user.id} userName={user.name} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
