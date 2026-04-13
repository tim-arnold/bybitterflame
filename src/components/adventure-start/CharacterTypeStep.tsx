import type { PresetCharacter } from "@/lib/adventures/types";
import type { RosterCharacter } from "./types";

interface CharacterTypeStepProps {
  roster: RosterCharacter[];
  rosterLoaded: boolean;
  isCreating: boolean;
  onRollYourOwn: () => void;
  onSelectExistingCharacter: (char: RosterCharacter) => void;
  onGmDecides: () => void;
  onQuickStart?: () => void;
  presetCharacter?: PresetCharacter;
  adventureLevelMin?: number;
  adventureLevelMax?: number;
}

export function CharacterTypeStep({
  roster,
  rosterLoaded,
  isCreating,
  onRollYourOwn,
  onSelectExistingCharacter,
  onGmDecides,
  onQuickStart,
  presetCharacter,
  adventureLevelMin,
  adventureLevelMax,
}: CharacterTypeStepProps) {
  function levelNote(char: RosterCharacter): string | null {
    if (adventureLevelMin === undefined || adventureLevelMax === undefined) return null;
    if (char.level < adventureLevelMin) return `Lvl ${char.level} — below adventure minimum (extra companions granted)`;
    if (char.level > adventureLevelMax) return `Lvl ${char.level} — above adventure range`;
    return null;
  }
  return (
    <div className="animate-content-in rounded-lg border border-stone-800 bg-stone-950/90 p-6 space-y-6">
      {/* Quick Start — when a preset character exists */}
      {presetCharacter && onQuickStart && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400 mb-3">
            Quick Start
          </h2>
          <button
            onClick={onQuickStart}
            disabled={isCreating}
            className="w-full rounded-lg border-2 border-amber-600 bg-amber-950/40 px-4 py-4 text-left transition-colors hover:border-amber-500 hover:bg-amber-950/60 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <p className="font-semibold text-amber-400 text-lg">{presetCharacter.name}</p>
            <p className="text-sm text-stone-300 mt-0.5">
              Lvl {presetCharacter.level} {presetCharacter.ancestry} {presetCharacter.class}
              {presetCharacter.specialization ? ` (${presetCharacter.specialization})` : ""}
            </p>
            <p className="text-xs text-stone-400 mt-1">
              Jump straight into the adventure with a pre-made character
            </p>
          </button>
        </div>
      )}

      {/* New Character options — grouped */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400 mb-3">
          Create a New Character
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {/* Option A: Roll Your Own */}
          <button
            onClick={onRollYourOwn}
            disabled={isCreating}
            className="rounded-lg border border-[var(--color-gold-dim)] bg-stone-900 px-4 py-4 text-center transition-colors hover:border-[var(--color-gold)] hover:bg-stone-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <p className="font-semibold text-[var(--color-gold)]">Roll Your Own</p>
            <p className="text-sm text-stone-400 mt-1">
              Step through character creation with the GM
            </p>
          </button>

          {/* Option C: GM Decides */}
          <button
            onClick={onGmDecides}
            disabled={isCreating}
            className="rounded-lg border border-[var(--color-gold-dim)] bg-stone-900 px-4 py-4 text-center transition-colors hover:border-[var(--color-gold)] hover:bg-stone-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <p className="font-semibold text-[var(--color-gold)]">Let the GM Decide</p>
            <p className="text-sm text-stone-400 mt-1">
              Answer a few quick questions and jump straight in
            </p>
          </button>
        </div>
      </div>

      {/* Option B: Play as Existing Character */}
      {rosterLoaded && roster.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400 mb-3">
            Play as an Existing Character
          </h2>
          <div className="space-y-2">
            {[...roster].sort((a, b) => {
              const aBusy = a.lastCampaignState === "active" ? 1 : 0;
              const bBusy = b.lastCampaignState === "active" ? 1 : 0;
              return aBusy - bBusy;
            }).map((char) => {
              const isBusy = char.lastCampaignState === "active";
              const note = levelNote(char);
              const isUnderleveled =
                adventureLevelMin !== undefined && char.level < adventureLevelMin;
              const isOverleveled =
                adventureLevelMax !== undefined && char.level > adventureLevelMax;
              return (
                <button
                  key={char.id}
                  onClick={() => !isBusy && onSelectExistingCharacter(char)}
                  disabled={isCreating || isBusy}
                  className={`w-full rounded-lg border bg-stone-900 px-4 py-3 text-left transition-colors disabled:cursor-not-allowed ${
                    isBusy
                      ? "border-stone-800"
                      : "border-[var(--color-gold-dim)] hover:border-[var(--color-gold)] hover:bg-stone-800 cursor-pointer disabled:opacity-50"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={`font-semibold ${isBusy ? "text-stone-500" : "text-[var(--color-gold)]"}`}>{char.name}</span>
                    <span className="text-xs text-stone-500 shrink-0">
                      Lvl {char.level} {char.ancestry} {char.class}
                    </span>
                  </div>
                  {isBusy ? (
                    <p className="text-xs text-stone-500 mt-0.5">Already adventuring elsewhere</p>
                  ) : note && isUnderleveled ? (
                    <p className="text-xs text-amber-500 mt-0.5">{note}</p>
                  ) : note && isOverleveled ? (
                    <p className="text-xs text-orange-500 mt-0.5">{note}</p>
                  ) : char.lastAdventureTitle ? (
                    <p className="text-xs text-stone-500 mt-0.5 truncate">
                      Last played: {char.lastAdventureTitle}
                    </p>
                  ) : null}
                </button>
              );
            })}
          </div>
          {adventureLevelMin !== undefined &&
            adventureLevelMax !== undefined &&
            roster.every((c) => c.lastCampaignState === "active") && (
              <p className="text-xs text-stone-500 mt-2">
                All your characters are currently adventuring elsewhere.
              </p>
            )}
        </div>
      )}
    </div>
  );
}