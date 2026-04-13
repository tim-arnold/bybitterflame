import type { Companion } from "@/lib/game/types";
import type { AvailableCharacter, AvailableResponse, FormerCompanionEntry, RosterCharacter } from "./types";

interface CompanionStepProps {
  /** If set, shows "Who travels with {name}?" and former companions */
  selectedCharacter: RosterCharacter | null;
  maxCompanions: number;
  availableData: AvailableResponse | null;
  availableLoading: boolean;
  selectedCompanions: Companion[];
  isCreating: boolean;
  onToggleCompanion: (companion: Companion) => void;
  onPlayAsCompanion?: (companion: Companion) => void;
  onContinue: () => void;
  onBack: () => void;
  /** Label for the continue button when companions are selected */
  continueLabelWithCompanions?: (companions: Companion[]) => string;
}

export function companionFromRosterChar(char: AvailableCharacter): Companion {
  return {
    id: crypto.randomUUID(),
    name: char.name,
    pronouns: "they/them",
    ancestry: char.ancestry,
    class: char.class,
    level: char.level,
    alignment: "Neutral",
    background: "",
    str: char.str,
    dex: char.dex,
    con: char.con,
    int: char.int,
    wis: char.wis,
    cha: char.cha,
    hp: char.maxHp,
    maxHp: char.maxHp,
    ac: char.ac,
    equipment: char.equipment,
    spells: char.spells,
    talents: char.talents,
    status: "active",
    joinedAt: new Date().toISOString(),
    personality: {
      voice: `A seasoned ${char.class}`,
      dispositionTowardPlayer: "friendly",
      riskTolerance: "bold",
      followership: "collaborates",
      loyalty: 7,
      motivation: "Adventuring alongside an old ally",
      redLines: "Will not betray the party",
    },
  };
}

function CompanionCard({
  name,
  subtitle,
  selected,
  slotsFull,
  isCreating,
  onToggle,
  onPlayAs,
}: {
  name: string;
  subtitle: string;
  selected: boolean;
  slotsFull: boolean;
  isCreating: boolean;
  onToggle: () => void;
  onPlayAs?: () => void;
}) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 transition-colors ${
        selected ? "border-[var(--color-gold-dim)] bg-stone-800" : "border-stone-700 bg-stone-900"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-stone-100">{name}</p>
          <p className="text-xs text-stone-400 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={onToggle}
            disabled={isCreating || slotsFull}
            className={`rounded border px-3 py-1 text-xs font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              selected
                ? "border-[var(--color-gold-dim)] text-[var(--color-gold)] bg-stone-700"
                : "border-stone-600 text-stone-300 hover:border-stone-400 hover:text-stone-100"
            }`}
          >
            {selected ? "✓ Selected" : "Bring along"}
          </button>
          {onPlayAs && (
            <button
              onClick={onPlayAs}
              disabled={isCreating}
              className="rounded border border-stone-600 px-3 py-1 text-xs font-medium text-stone-300 transition-colors hover:border-stone-400 hover:text-stone-100 cursor-pointer disabled:opacity-50"
            >
              Play as {name.split(" ")[0]}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function CompanionStep({
  selectedCharacter,
  maxCompanions,
  availableData,
  availableLoading,
  selectedCompanions,
  isCreating,
  onToggleCompanion,
  onPlayAsCompanion,
  onContinue,
  onBack,
  continueLabelWithCompanions,
}: CompanionStepProps) {
  const title = selectedCharacter
    ? `Who travels with ${selectedCharacter.name}?`
    : "Who will travel with you?";

  const subtitle = selectedCharacter
    ? maxCompanions === 1
      ? "Bring up to 1 companion"
      : `Bring up to ${maxCompanions} companions`
    : "Optionally bring a companion along";

  const hasFormerCompanions =
    selectedCharacter &&
    availableData &&
    availableData.formerCompanions.length > 0;

  const hasAvailableChars =
    availableData && availableData.availableCharacters.length > 0;

  const hasAnyOptions = hasFormerCompanions || hasAvailableChars;

  const continueLabel = (() => {
    if (isCreating) return "Preparing…";
    if (selectedCompanions.length === 0) {
      return selectedCharacter ? "Begin Adventure Solo →" : "Continue Solo →";
    }
    if (continueLabelWithCompanions) return continueLabelWithCompanions(selectedCompanions);
    if (selectedCompanions.length === 1) {
      return `Continue with ${selectedCompanions[0].name.split(" ")[0]} →`;
    }
    return `Continue with ${selectedCompanions.length} companions →`;
  })();

  return (
    <div className="animate-content-in rounded-lg border border-stone-800 bg-stone-950/90 p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-100">{title}</h2>
          <p className="text-xs text-stone-400 mt-0.5">{subtitle}</p>
          {selectedCharacter &&
            maxCompanions > 1 && (
              <p className="text-xs text-[var(--color-gold-dim)] mt-0.5">
                — this adventure is above your level
              </p>
            )}
        </div>
        <button
          onClick={onBack}
          className="shrink-0 text-sm text-stone-400 hover:text-stone-200 transition-colors"
        >
          ← Back
        </button>
      </div>

      {availableLoading && (
        <p className="text-sm text-stone-500">Loading companions…</p>
      )}

      {!availableLoading && (
        <>
          {selectedCompanions.length > 0 && (
            <p className="text-xs text-stone-400">
              {selectedCompanions.length} / {maxCompanions} companion
              {maxCompanions > 1 ? "s" : ""} selected
              {selectedCompanions.length >= maxCompanions && (
                <span className="ml-1 text-stone-500">(slots full)</span>
              )}
            </p>
          )}

          {/* Former companions (shown for existing character path) */}
          {hasFormerCompanions && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                Former Companions
              </h3>
              <div className="space-y-2">
                {(availableData?.formerCompanions as FormerCompanionEntry[]).map(
                  ({ companion, lastSeenIn }) => {
                    const selected = selectedCompanions.some((c) => c.name === companion.name);
                    const slotsFull = !selected && selectedCompanions.length >= maxCompanions;
                    return (
                      <CompanionCard
                        key={companion.name}
                        name={companion.name}
                        subtitle={`Lvl ${companion.level} ${companion.ancestry} ${companion.class}${lastSeenIn ? ` · Last seen in ${lastSeenIn}` : ""}`}
                        selected={selected}
                        slotsFull={slotsFull}
                        isCreating={isCreating}
                        onToggle={() =>
                          onToggleCompanion({ ...companion, hp: companion.maxHp })
                        }
                        onPlayAs={
                          onPlayAsCompanion
                            ? () => onPlayAsCompanion(companion)
                            : undefined
                        }
                      />
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* Available roster characters */}
          {hasAvailableChars && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                Available Adventurers
              </h3>
              <div className="space-y-2">
                {availableData?.availableCharacters.map((char) => {
                  const companion = companionFromRosterChar(char);
                  const selected = selectedCompanions.some((c) => c.name === char.name);
                  const slotsFull = !selected && selectedCompanions.length >= maxCompanions;
                  return (
                    <CompanionCard
                      key={char.id}
                      name={char.name}
                      subtitle={`Lvl ${char.level} ${char.ancestry} ${char.class}${char.lastAdventureTitle ? ` · Last played: ${char.lastAdventureTitle}` : ""}`}
                      selected={selected}
                      slotsFull={slotsFull}
                      isCreating={isCreating}
                      onToggle={() => onToggleCompanion(companion)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {!hasAnyOptions && (
            <p className="text-sm text-stone-500">
              No available adventurers found — you&apos;ll adventure solo.
            </p>
          )}

          <button
            onClick={onContinue}
            disabled={isCreating}
            className="w-full rounded-lg border border-[var(--color-gold-dim)] bg-stone-800 px-4 py-2.5 text-sm font-semibold text-[var(--color-gold)] transition-colors hover:border-[var(--color-gold)] hover:bg-stone-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {continueLabel}
          </button>
        </>
      )}
    </div>
  );
}
