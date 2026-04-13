"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { AbilityScoreDisplay } from "@/components/character/AbilityScoreDisplay";
import type { EquipmentItem, Spell } from "@/lib/game/types";

interface CharacterDetail {
  id: string;
  name: string;
  pronouns: string;
  ancestry: string;
  class: string;
  level: number;
  xp: number;
  alignment: string;
  background: string;
  deity: string;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  hp: number;
  maxHp: number;
  ac: number;
  gold: number;
  silver: number;
  copper: number;
  equipment: EquipmentItem[];
  spells: Spell[];
  talents: string[];
  features: string[];
  languages: string[];
  createdAt: string;
}

interface CampaignEntry {
  id: string;
  name: string;
  state: "active" | "completed" | "abandoned";
  adventureTitle: string;
  companions: { name: string; ancestry: string; class: string; level: number; status: string }[];
  createdAt: string;
  updatedAt: string;
}

interface CompanionEntry {
  name: string;
  ancestry: string;
  class: string;
  level: number;
  status: string;
  lastSeenIn: string;
}

const STATE_LABELS: Record<string, string> = {
  active: "Ongoing",
  completed: "Completed",
  abandoned: "Abandoned",
};

const STATE_COLORS: Record<string, string> = {
  active: "text-[var(--color-gold)]",
  completed: "text-emerald-400",
  abandoned: "text-stone-500",
};

function flavorNarrative(char: CharacterDetail, campaigns: CampaignEntry[]): string {
  const classFlavorMap: Record<string, string> = {
    Fighter: "a hardened blade-for-hire, forged in blood and iron",
    Thief: "a shadow-walker who moves between worlds others can't see",
    Wizard: "a scholar of forbidden arts, trading sanity for power",
    Priest: "a vessel of divine will, as much instrument as person",
  };
  const classFlavor = classFlavorMap[char.class] ?? "a wanderer of no fixed creed";

  const completedCount = campaigns.filter((c) => c.state === "completed").length;
  const allCompanionNames = Array.from(
    new Set(campaigns.flatMap((c) => c.companions.map((co) => co.name)))
  );

  let text = `The name ${char.name} is spoken in certain taverns — ${classFlavor}, `;
  text += char.level >= 5
    ? `a veteran of ${char.level} seasons worth of hard lessons. `
    : `still proving themselves against the dark. `;

  if (completedCount > 0) {
    text += completedCount === 1
      ? `One adventure behind them, and the roads show it. `
      : `${completedCount} adventures behind them, and the roads show it. `;
  } else {
    text += `Not yet a name in any bard's tale, but the story is still being written. `;
  }

  if (allCompanionNames.length === 0) {
    text += `They walk alone, or near enough.`;
  } else if (allCompanionNames.length === 1) {
    text += `Ask anyone who's traveled with ${allCompanionNames[0]} — they'll tell you ${char.name} is the kind of ${char.class.toLowerCase()} you want at your side.`;
  } else {
    const listed = allCompanionNames.slice(0, 3).join(", ");
    text += `Those who've traveled alongside them — ${listed}${allCompanionNames.length > 3 ? ", and others" : ""} — speak of a ${char.class.toLowerCase()} worth knowing.`;
  }

  return text;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-xs uppercase tracking-widest text-stone-500 mb-3 border-b border-stone-800 pb-1">
        {label}
      </h2>
      {children}
    </div>
  );
}

export default function CharacterDetailPage() {
  const { characterId } = useParams<{ characterId: string }>();
  const router = useRouter();
  const [character, setCharacter] = useState<CharacterDetail | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignEntry[]>([]);
  const [allCompanions, setAllCompanions] = useState<CompanionEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/character/${characterId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setCharacter(data.character);
        setCampaigns(data.campaigns ?? []);
        setAllCompanions(data.allCompanions ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoaded(true));
  }, [characterId]);

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/character/${characterId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/?tab=characters");
      } else {
        const data = await res.json();
        setDeleteError(data.error ?? "Something went wrong.");
        setDeleteConfirm(false);
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <main className="relative min-h-screen">
      <div className="fixed inset-0 bg-[url('/bg-woodcut.webp')] bg-cover bg-center" />

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-12">
        {/* Back link */}
        <button onClick={() => router.push("/?tab=characters")} className="text-sm text-stone-400 hover:text-stone-300 transition-colors cursor-pointer">
          ← Back
        </button>

        {!loaded ? (
          <p className="text-stone-500 text-sm mt-8">Loading…</p>
        ) : error || !character ? (
          <div className="mt-8 rounded-lg border border-stone-800 bg-stone-950/90 p-6 text-center">
            <p className="text-stone-400 text-sm">Character not found.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Header */}
            <div className="rounded-lg border border-stone-800 bg-stone-950/90 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-uncial text-3xl text-[var(--color-gold)] leading-tight">
                    {character.name}
                  </h1>
                  <p className="text-stone-400 text-sm mt-1">
                    Level {character.level} {character.ancestry} {character.class}
                    {character.alignment ? ` · ${character.alignment}` : ""}
                  </p>
                  <p className="text-stone-500 text-xs mt-0.5">{character.pronouns}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-bold text-stone-100">{character.hp}<span className="text-stone-500 text-base font-normal">/{character.maxHp}</span></div>
                  <div className="text-xs text-stone-500">HP</div>
                  <div className="mt-1 text-lg font-semibold text-stone-300">AC {character.ac}</div>
                </div>
              </div>

              {/* XP bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                  <span>XP</span>
                  <span>{character.xp} / {character.level * 10}</span>
                </div>
                <div className="h-1.5 rounded-full bg-stone-800 overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-gold)] rounded-full transition-all"
                    style={{ width: `${Math.min(100, (character.xp / (character.level * 10)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Flavor narrative */}
            <div className="rounded-lg border border-stone-800 bg-stone-950/90 px-6 py-5">
              <p className="font-serif text-stone-300 text-sm leading-relaxed italic">
                "{flavorNarrative(character, campaigns)}"
              </p>
            </div>

            {/* Stats + attributes */}
            <div className="rounded-lg border border-stone-800 bg-stone-950/90 px-6 py-5">
              <StatSection label="Ability Scores">
                <div className="flex gap-2 flex-wrap">
                  <AbilityScoreDisplay label="Strength" abbreviated="STR" value={character.str} />
                  <AbilityScoreDisplay label="Dexterity" abbreviated="DEX" value={character.dex} />
                  <AbilityScoreDisplay label="Constitution" abbreviated="CON" value={character.con} />
                  <AbilityScoreDisplay label="Intelligence" abbreviated="INT" value={character.int} />
                  <AbilityScoreDisplay label="Wisdom" abbreviated="WIS" value={character.wis} />
                  <AbilityScoreDisplay label="Charisma" abbreviated="CHA" value={character.cha} />
                </div>
              </StatSection>

              <StatSection label="Details">
                <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Background</span>
                    <span className="text-stone-200">{character.background}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Gold</span>
                    <span className="text-stone-200">{character.gold} gp</span>
                  </div>
                  {character.languages.length > 0 && (
                    <div className="flex justify-between col-span-2">
                      <span className="text-stone-500">Languages</span>
                      <span className="text-stone-200 text-right">{character.languages.join(", ")}</span>
                    </div>
                  )}
                </div>
              </StatSection>

              {character.talents.length > 0 && (
                <StatSection label="Talents">
                  <ul className="space-y-1">
                    {character.talents.map((t, i) => (
                      <li key={i} className="text-sm text-stone-300 flex gap-2">
                        <span className="text-[var(--color-gold)] shrink-0">·</span>
                        <span>{typeof t === "string" ? t : (t as { name?: string; description?: string }).name ?? JSON.stringify(t)}</span>
                      </li>
                    ))}
                  </ul>
                </StatSection>
              )}

              {character.equipment.length > 0 && (
                <StatSection label="Equipment">
                  <ul className="space-y-1">
                    {character.equipment.map((item, i) => (
                      <li key={i} className="text-sm flex items-baseline gap-2">
                        <span className="text-[var(--color-gold)] shrink-0">·</span>
                        <span className="text-stone-300">{item.name}</span>
                        {item.damage && (
                          <span className="text-stone-500 text-xs">{item.damage}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </StatSection>
              )}

              {character.spells.length > 0 && (
                <StatSection label="Spells">
                  <ul className="space-y-2">
                    {character.spells.map((spell, i) => (
                      <li key={i} className="text-sm">
                        <span className="text-stone-200 font-medium">{spell.name}</span>
                        <span className="text-stone-500 text-xs ml-2">T{spell.tier}</span>
                        {spell.description && (
                          <p className="text-stone-400 text-xs mt-0.5">{spell.description}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </StatSection>
              )}
            </div>

            {/* Adventure history */}
            <div className="rounded-lg border border-stone-800 bg-stone-950/90 px-6 py-5">
              <StatSection label="Adventure History">
                {campaigns.length === 0 ? (
                  <p className="text-stone-500 text-sm">No adventures yet.</p>
                ) : (
                  <div className="space-y-3">
                    {campaigns.map((camp) => (
                      <div key={camp.id} className="border border-stone-800 rounded-lg px-4 py-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-stone-200 truncate">
                              {camp.state === "active" ? (
                                <Link href={`/play/${camp.id}`} className="hover:text-[var(--color-gold)] transition-colors">
                                  {camp.adventureTitle}
                                </Link>
                              ) : (
                                camp.adventureTitle
                              )}
                            </p>
                            {camp.companions.length > 0 && (
                              <p className="text-xs text-stone-500 mt-0.5">
                                With: {camp.companions.map((c) => c.name).join(", ")}
                              </p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`text-xs font-medium ${STATE_COLORS[camp.state]}`}>
                              {STATE_LABELS[camp.state]}
                            </span>
                            <p className="text-xs text-stone-600 mt-0.5">{formatDate(camp.updatedAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </StatSection>
            </div>

            {/* Companions met */}
            {allCompanions.length > 0 && (
              <div className="rounded-lg border border-stone-800 bg-stone-950/90 px-6 py-5">
                <StatSection label="Companions Met">
                  <div className="space-y-2">
                    {allCompanions.map((c) => (
                      <div key={c.name} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-stone-200 font-medium">{c.name}</span>
                          <span className="text-stone-500 text-xs ml-2">
                            Lvl {c.level} {c.ancestry} {c.class}
                          </span>
                        </div>
                        <span className="text-xs text-stone-600 text-right max-w-[40%] truncate">
                          {c.lastSeenIn}
                        </span>
                      </div>
                    ))}
                  </div>
                </StatSection>
              </div>
            )}

            <p className="text-xs text-stone-600 text-center pb-2">
              Created {formatDate(character.createdAt)}
            </p>

            {/* Danger zone */}
            {(() => {
              const hasActiveCampaign = campaigns.some((c) => c.state === "active");
              return (
                <div className="rounded-lg border border-red-900/50 bg-stone-950/90 px-6 py-5">
                  <h2 className="text-xs uppercase tracking-widest text-red-800 mb-4">Danger Zone</h2>
                  {hasActiveCampaign ? (
                    <p className="text-sm text-stone-500">
                      {character.name} is currently adventuring and cannot be deleted.
                    </p>
                  ) : deleteError ? (
                    <p className="text-sm text-red-400 mb-4">{deleteError}</p>
                  ) : deleteConfirm ? (
                    <div>
                      <p className="text-sm text-stone-300 mb-1">
                        Permanently delete <span className="font-semibold text-stone-100">{character.name}</span>?
                      </p>
                      <p className="text-xs text-stone-500 mb-4">This cannot be undone. The character and all their adventure history will be permanently deleted.</p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="rounded border border-red-800 bg-stone-900 px-4 py-2 text-sm font-medium text-red-400 hover:border-red-600 hover:bg-stone-800 disabled:opacity-50 cursor-pointer transition-colors"
                        >
                          {isDeleting ? "Deleting…" : "Yes, delete forever"}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(false)}
                          disabled={isDeleting}
                          className="rounded border border-stone-700 bg-stone-900 px-4 py-2 text-sm text-stone-400 hover:border-stone-500 hover:bg-stone-800 disabled:opacity-50 cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setDeleteConfirm(true); setDeleteError(null); }}
                      className="rounded border border-red-900/60 bg-stone-900 px-4 py-2 text-sm text-red-700 hover:border-red-800 hover:text-red-500 cursor-pointer transition-colors"
                    >
                      Delete character
                    </button>
                  )}
                </div>
              );
            })()}

            <SiteFooter />
          </div>
        )}
      </div>
    </main>
  );
}
