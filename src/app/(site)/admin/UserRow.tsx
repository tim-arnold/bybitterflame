"use client";

import { useState } from "react";
import { BetaKeyForm } from "./BetaKeyForm";
import { DeleteUserButton } from "./DeleteUserButton";
import { GrantTurnsForm } from "./GrantTurnsForm";

interface User {
  id: string;
  name: string;
  email: string;
  joinedLabel: string;         // pre-formatted date string
  keyStatusBadge: React.ReactNode;
  isAdmin: boolean;
  anthropicApiKey: string | null;
  betaApiKey: string | null;
  betaApiKeyMasked: string | null;
  betaKeyMode: string | null;
  serverKeyTurnsUsed: number;
  serverKeyTurnsBonus: number;
  serverKeyTurnLimit: number;
  // token stats (pre-formatted)
  tokensLabel: string;
  costLabel: string;
  ownKeyTokensLabel: string | null;
  ownKeyCostLabel: string | null;
}

export function UserRow({ user }: { user: User }) {
  const [open, setOpen] = useState(false);

  const showGrantTurns = !user.anthropicApiKey && user.betaKeyMode !== "full";

  return (
    <>
      {/* Summary row */}
      <tr
        className="hover:bg-stone-900/40 transition-colors cursor-pointer select-none"
        onClick={() => setOpen((v) => !v)}
      >
        <td className="px-4 py-3">
          <p className="font-medium text-stone-100">{user.name}</p>
          <p className="text-xs text-stone-400">{user.email}</p>
        </td>
        <td className="px-4 py-3 text-xs text-stone-400 whitespace-nowrap">
          {user.joinedLabel}
        </td>
        <td className="px-4 py-3">
          {user.keyStatusBadge}
        </td>
        <td className="px-4 py-3 text-right">
          <span className="text-stone-500 text-xs select-none">
            {open ? "▾" : "▸"}
          </span>
        </td>
      </tr>

      {/* Expanded detail panel */}
      {open && (
        <tr className="bg-stone-900/60 border-t border-stone-800/40">
          <td colSpan={4} className="px-6 py-4">
            <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-x-8 gap-y-1 items-start">

              {/* Tokens */}
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">Tokens / Cost</p>
                <p className="text-xs text-stone-300">{user.tokensLabel}</p>
                <p className="text-xs text-stone-500">{user.costLabel}</p>
                {user.ownKeyTokensLabel && (
                  <>
                    <p className="text-xs text-stone-500 mt-1.5">Own key:</p>
                    <p className="text-xs text-stone-300">{user.ownKeyTokensLabel}</p>
                    <p className="text-xs text-stone-500">{user.ownKeyCostLabel}</p>
                  </>
                )}
              </div>

              {/* Bonus Turns */}
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">Bonus Turns</p>
                {showGrantTurns ? (
                  <GrantTurnsForm
                    userId={user.id}
                    initialBonus={user.serverKeyTurnsBonus ?? 0}
                    turnsUsed={user.serverKeyTurnsUsed}
                    baseLimit={user.serverKeyTurnLimit}
                  />
                ) : (
                  <span className="text-xs text-stone-600">—</span>
                )}
              </div>

              {/* Beta Key */}
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">Beta Key</p>
                <BetaKeyForm
                  endpoint={`/api/admin/users/${user.id}/beta-key`}
                  initialMasked={user.betaApiKeyMasked}
                  initialMode={(user.betaKeyMode as "trial" | "full") ?? null}
                />
              </div>

              {/* Delete */}
              <div className="flex items-start pt-5">
                {!user.isAdmin && (
                  <DeleteUserButton userId={user.id} userName={user.name} />
                )}
              </div>

            </div>
          </td>
        </tr>
      )}
    </>
  );
}
