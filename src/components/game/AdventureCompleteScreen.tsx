"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Character, Companion, Spell } from "@/lib/game/types";
import {
  shouldLevelUp,
  getHitDie,
  getStatMod,
  isOddLevel,
  getSpellsGained,
  getTalentResult,
  buildTalentString,
  statUpdatesFromTalent,
  autoResolveCompanionLevelUp,
  type TalentResult,
} from "@/lib/game/leveling";
import { getAvailableSpellsForPicker } from "@/lib/game/spells";
import { getDowntimeOutcomeForRoll } from "./adventure-complete/constants";
import type { DowntimeTier, SpellPickState, HpRollResult, AdventureCompleteScreenProps, CompanionCarouseResult, CarouseWorldStatePatches } from "./adventure-complete/types";
import { VictoryPhase } from "./adventure-complete/VictoryPhase";
import { CarousingPhase } from "./adventure-complete/CarousingPhase";
import { RollingPhase } from "./adventure-complete/RollingPhase";
import { ResultPhase } from "./adventure-complete/ResultPhase";
import { LevelUpHPPhase } from "./adventure-complete/LevelUpHPPhase";
import { LevelUpTalentPhase } from "./adventure-complete/LevelUpTalentPhase";
import { LevelUpSpellsPhase } from "./adventure-complete/LevelUpSpellsPhase";
import { DonePhase } from "./adventure-complete/DonePhase";

type Phase =
  | "victory"
  | "carousing"
  | "rolling"
  | "result"
  | "leveling-hp"
  | "leveling-talent"
  | "leveling-spells"
  | "done";

export function AdventureCompleteScreen({
  summary,
  characterName,
  rewardDescription,
  character,
  companions,
  campaignType,
  campaignId,
  onCarouseComplete,
}: AdventureCompleteScreenProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>("victory");

  // ── Carousing state ──────────────────────────────────────────────────────
  const [selectedTier, setSelectedTier] = useState<DowntimeTier | null>(null);
  const [animRoll, setAnimRoll] = useState(1);
  const [finalRoll, setFinalRoll] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<import("./adventure-complete/types").DowntimeOutcome | null>(null);
  const [xpGained, setXpGained] = useState(0);
  const [goldLost, setGoldLost] = useState(0);
  const [playerTierCost, setPlayerTierCost] = useState(0);
  const [companionShortfall, setCompanionShortfall] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [companionResults, setCompanionResults] = useState<CompanionCarouseResult[]>([]);
  const [characterPatches, setCharacterPatches] = useState<Partial<import("@/lib/game/types").Character> | undefined>(undefined);
  const [worldStatePatches, setWorldStatePatches] = useState<CarouseWorldStatePatches | undefined>(undefined);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Level-up state ───────────────────────────────────────────────────────
  const [levelUpNewLevel, setLevelUpNewLevel] = useState(0);
  const [levelUpOverride, setLevelUpOverride] = useState<Partial<Character>>({});
  const [hpAnimRoll, setHpAnimRoll] = useState(1);
  const [hpResult, setHpResult] = useState<HpRollResult | null>(null);
  const [talentAnimRoll, setTalentAnimRoll] = useState(2);
  const [talentRoll, setTalentRoll] = useState<number | null>(null);
  const [talentEntry, setTalentEntry] = useState<TalentResult | null>(null);
  const [talentChoice, setTalentChoice] = useState<string | null>(null);
  const [talentTextInput, setTalentTextInput] = useState("");
  const [spellPickQueue, setSpellPickQueue] = useState<SpellPickState[]>([]);
  const [spellPickIdx, setSpellPickIdx] = useState(0);
  const [spellPickSelected, setSpellPickSelected] = useState<Spell[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, []);

  // ── Carousing handlers ───────────────────────────────────────────────────

  function handleSkip() {
    if (!completed) {
      setCompleted(true);
      onCarouseComplete(0, 0, undefined, undefined, undefined, undefined);
    }
    setPhase("done");
  }

  function handleRoll() {
    if (!selectedTier) return;
    setPhase("rolling");

    const d10 = Math.floor(Math.random() * 10) + 1;
    const total = Math.min(d10 + selectedTier.rollBonus, 14);
    const xp = selectedTier.xpEarned;

    let ticks = 0;
    const totalTicks = 18;
    animRef.current = setInterval(() => {
      const showFinal = ticks >= totalTicks - 3;
      const display = showFinal
        ? total
        : Math.min(Math.floor(Math.random() * 10) + 1 + selectedTier.rollBonus, 14);
      setAnimRoll(display);
      ticks++;
      if (ticks >= totalTicks) {
        if (animRef.current) clearInterval(animRef.current);
        setAnimRoll(total);
        setFinalRoll(total);

        const result = getDowntimeOutcomeForRoll(total, character.class ?? "Fighter");

        // Split tier cost equally among the party
        const activeCompanions = (companions ?? []).filter((c) => c.status === "active");
        const partySize = 1 + activeCompanions.length;
        const companionTierCost = Math.floor(selectedTier.goldCost / partySize);
        // Player absorbs any rounding remainder
        const calcPlayerTierCost = selectedTier.goldCost - companionTierCost * activeCompanions.length;

        // Compute companion XP gains, gold deductions, and auto-resolve level-ups
        let totalShortfall = 0;
        const compResults: CompanionCarouseResult[] = activeCompanions.map((c) => {
          const prevXp = c.xp ?? 0;
          const newXp = prevXp + xp;
          const companionGoldAvailable = c.gold ?? 0;
          const shortfall = Math.max(0, companionTierCost - companionGoldAvailable);
          const deducted = companionTierCost - shortfall;
          totalShortfall += shortfall;
          const updatedBase = { ...c, xp: newXp, gold: Math.max(0, companionGoldAvailable - companionTierCost) };
          if (shouldLevelUp(newXp, c.level)) {
            const levelUp = autoResolveCompanionLevelUp(updatedBase);
            return {
              companion: levelUp.companion,
              xpGained: xp,
              leveled: true,
              hpGained: levelUp.hpGained,
              talentGained: levelUp.talentGained || undefined,
              goldDeducted: deducted,
              goldShortfall: shortfall > 0 ? shortfall : undefined,
            };
          }
          return {
            companion: updatedBase,
            xpGained: xp,
            leveled: false,
            goldDeducted: deducted,
            goldShortfall: shortfall > 0 ? shortfall : undefined,
          };
        });

        const totalGoldLost = calcPlayerTierCost + totalShortfall;

        setOutcome(result);
        setXpGained(xp);
        setGoldLost(totalGoldLost);
        setPlayerTierCost(calcPlayerTierCost);
        setCompanionShortfall(totalShortfall);
        setCompanionResults(compResults);
        setCharacterPatches(undefined);
        setWorldStatePatches(undefined);

        setPhase("result");
      }
    }, 80);
  }

  function handleConfirmResult() {
    const currentXp = character.xp ?? 0;
    const currentLevel = character.level ?? 1;

    if (!completed && shouldLevelUp(currentXp + xpGained, currentLevel)) {
      const newLevel = currentLevel + 1;
      setLevelUpNewLevel(newLevel);
      setLevelUpOverride({ level: newLevel, xp: 0 });
      startHpRoll(newLevel);
    } else {
      if (!completed) {
        setCompleted(true);
        onCarouseComplete(xpGained, goldLost, undefined, companionResults.map((r) => r.companion), characterPatches, worldStatePatches);
      }
      setPhase("done");
    }
  }

  // ── Level-up: HP roll ────────────────────────────────────────────────────

  function startHpRoll(newLevel: number) {
    setPhase("leveling-hp");
    setHpResult(null);

    const die = getHitDie(character.class ?? "Fighter");
    const isKnocker = (character.ancestry ?? "").toLowerCase() === "knocker";

    const roll1 = Math.floor(Math.random() * die) + 1;
    const conMod = getStatMod(character.con ?? 10);
    const knockerBonus = isKnocker ? 1 : 0;
    const total = Math.max(1, roll1 + conMod) + knockerBonus;

    let ticks = 0;
    const totalTicks = 16;
    animRef.current = setInterval(() => {
      setHpAnimRoll(Math.floor(Math.random() * die) + 1);
      ticks++;
      if (ticks >= totalTicks) {
        if (animRef.current) clearInterval(animRef.current);
        setHpAnimRoll(roll1);
        setHpResult({ roll: roll1, roll2: undefined, conMod, total });
        setLevelUpOverride((prev) => ({
          ...prev,
          maxHp: (character.maxHp ?? 1) + total,
          hp: (character.hp ?? 1) + total,
        }));
      }
    }, 80);

    void newLevel;
  }

  function handleHpConfirm() {
    if (isOddLevel(levelUpNewLevel)) {
      startTalentRoll(levelUpNewLevel);
    } else {
      proceedToSpellsOrDone(levelUpNewLevel);
    }
  }

  // ── Level-up: Talent roll ────────────────────────────────────────────────

  function startTalentRoll(newLevel: number) {
    setPhase("leveling-talent");
    setTalentRoll(null);
    setTalentEntry(null);
    setTalentChoice(null);
    setTalentTextInput("");

    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const total = die1 + die2;

    let ticks = 0;
    const totalTicks = 18;
    animRef.current = setInterval(() => {
      const showFinal = ticks >= totalTicks - 3;
      setTalentAnimRoll(
        showFinal ? total : Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 2
      );
      ticks++;
      if (ticks >= totalTicks) {
        if (animRef.current) clearInterval(animRef.current);
        setTalentAnimRoll(total);
        setTalentRoll(total);
        setTalentEntry(getTalentResult(character.specialization ?? character.class ?? "Knight", total));
      }
    }, 80);

    void newLevel;
  }

  function handleTalentConfirm() {
    if (!talentEntry) return;

    const choiceForString =
      talentEntry.choiceType === "none" ? null : (talentChoice ?? (talentTextInput.trim() || null));

    const talentStr = buildTalentString(talentEntry, choiceForString);
    const statUpdates = statUpdatesFromTalent(talentEntry, choiceForString, {
      ...character,
      ...levelUpOverride,
    });

    setLevelUpOverride((prev) => ({
      ...prev,
      ...statUpdates,
      talents: [...(character.talents ?? []), ...(prev.talents ?? []), talentStr],
    }));

    proceedToSpellsOrDone(levelUpNewLevel, talentEntry);
  }

  // ── Level-up: Spells ─────────────────────────────────────────────────────

  function proceedToSpellsOrDone(newLevel: number, resolvedTalent?: TalentResult) {
    const oldLevel = character.level ?? 1;
    let gained = getSpellsGained(character.class ?? "", oldLevel, newLevel);

    const isCasterSpellLearn =
      resolvedTalent?.choiceType === "spell-learn" && character.class === "Caster";
    if (isCasterSpellLearn) {
      gained = [{ tier: 0, count: 1 }, ...gained];
    }

    if (gained.length === 0) {
      finalizeLevelUp();
      return;
    }

    const knownNames = (character.spells ?? []).map((s) => s.name);
    // T1 neutral spells use "Caster"; T2+ path spells use the specialization (Druid/Sorcerer/Enchanter)
    const spellPathKey = (tier: number) =>
      tier <= 1 ? (character.class ?? "Caster") : (character.specialization ?? character.class ?? "Caster");

    const queue: SpellPickState[] = gained.map(({ tier, count }) => {
      const maxTier = tier === 0 ? Math.ceil(newLevel / 2) : tier;
      let available: Spell[];
      if (tier === 0) {
        // spell-learn talent: player picks any spell up to current max tier
        available = [];
        for (let t = 1; t <= maxTier; t++) {
          available.push(...getAvailableSpellsForPicker(spellPathKey(t), t, knownNames));
        }
      } else {
        available = getAvailableSpellsForPicker(spellPathKey(tier), tier, knownNames);
      }
      return { tier, count, available, selected: [] };
    });

    setSpellPickQueue(queue);
    setSpellPickIdx(0);
    setSpellPickSelected([]);
    setPhase("leveling-spells");
  }

  function toggleSpellSelection(spell: Spell) {
    const needed = spellPickQueue[spellPickIdx]?.count ?? 1;
    if (spellPickSelected.find((s) => s.name === spell.name)) {
      setSpellPickSelected(spellPickSelected.filter((s) => s.name !== spell.name));
    } else if (spellPickSelected.length < needed) {
      setSpellPickSelected([...spellPickSelected, spell]);
    }
  }

  function handleSpellPickConfirm() {
    const nextIdx = spellPickIdx + 1;
    setLevelUpOverride((prev) => ({
      ...prev,
      spells: [...(character.spells ?? []), ...(prev.spells ?? []), ...spellPickSelected],
    }));

    if (nextIdx < spellPickQueue.length) {
      setSpellPickIdx(nextIdx);
      setSpellPickSelected([]);
    } else {
      finalizeLevelUp();
    }
  }

  // ── Finalize ─────────────────────────────────────────────────────────────

  function finalizeLevelUp() {
    setCompleted(true);
    setPhase("done");
  }

  // When phase transitions to "done" after level-up, fire the callback.
  // We need the latest levelUpOverride, so we watch it via a ref.
  const levelUpOverrideRef = useRef<Partial<Character>>({});
  useEffect(() => {
    levelUpOverrideRef.current = levelUpOverride;
  }, [levelUpOverride]);

  const didFireCallback = useRef(false);
  useEffect(() => {
    if (phase === "done" && completed && !didFireCallback.current) {
      didFireCallback.current = true;
      if (levelUpNewLevel > 0) {
        onCarouseComplete(xpGained, goldLost, levelUpOverrideRef.current, companionResults.map((r) => r.companion), characterPatches, worldStatePatches);
      }
      // Non-level-up path already called onCarouseComplete before reaching "done".
    }
  }, [phase, completed]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ───────────────────────────────────────────────────────────────

  const currentSpellPick = spellPickQueue[spellPickIdx];

  function talentChoiceReady(): boolean {
    if (!talentEntry) return false;
    const ct = talentEntry.choiceType;
    if (ct === "none" || ct === "hp-roll" || ct === "spell-learn") return true;
    if (ct === "stat-choice" || ct === "spell-advantage") return talentChoice !== null;
    return false;
  }

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="fixed inset-0">
        <Image src="/bg-woodcut.webp" alt="" fill className="object-cover" priority />
      </div>

      <div className="relative z-10 px-4 py-12">
        <div className="w-full max-w-lg mx-auto space-y-6">
          {phase === "victory" && (
            <VictoryPhase
              summary={summary}
              rewardDescription={rewardDescription}
              onProceed={() => setPhase("carousing")}
              onSkip={handleSkip}
            />
          )}

          {phase === "carousing" && (
            <CarousingPhase
              characterClass={character.class ?? "Fighter"}
              currentGold={character.gold ?? 0}
              activeCompanionCount={(companions ?? []).filter((c) => c.status === "active").length}
              selectedTier={selectedTier}
              onSelectTier={setSelectedTier}
              onRoll={handleRoll}
              onSkip={handleSkip}
            />
          )}

          {phase === "rolling" && (
            <RollingPhase animRoll={animRoll} tierBonus={selectedTier?.rollBonus ?? 0} />
          )}

          {phase === "result" && outcome && finalRoll !== null && selectedTier && (
            <ResultPhase
              finalRoll={finalRoll}
              outcome={outcome}
              xpGained={xpGained}
              goldLost={goldLost}
              playerTierCost={playerTierCost}
              companionShortfall={companionShortfall}
              selectedTier={selectedTier}
              character={character}
              companionResults={companionResults}
              onConfirm={handleConfirmResult}
            />
          )}

          {phase === "leveling-hp" && (
            <LevelUpHPPhase
              levelUpNewLevel={levelUpNewLevel}
              hpAnimRoll={hpAnimRoll}
              hpResult={hpResult}
              characterClass={character.class ?? "Fighter"}
              characterAncestry={character.ancestry ?? ""}
              currentMaxHp={character.maxHp ?? 0}
              onConfirm={handleHpConfirm}
            />
          )}

          {phase === "leveling-talent" && (
            <LevelUpTalentPhase
              levelUpNewLevel={levelUpNewLevel}
              talentAnimRoll={talentAnimRoll}
              talentRoll={talentRoll}
              talentEntry={talentEntry}
              talentChoice={talentChoice}
              talentTextInput={talentTextInput}
              characterClass={character.specialization ?? character.class ?? "Knight"}
              characterStats={{
                str: character.str ?? 10,
                dex: character.dex ?? 10,
                con: character.con ?? 10,
                int: character.int ?? 10,
                wis: character.wis ?? 10,
                cha: character.cha ?? 10,
              }}
              knownSpells={character.spells ?? []}
              isChoiceReady={talentChoiceReady()}
              onSetTalentChoice={setTalentChoice}
              onSetTalentTextInput={setTalentTextInput}
              onConfirm={handleTalentConfirm}
            />
          )}

          {phase === "leveling-spells" && currentSpellPick && (
            <LevelUpSpellsPhase
              levelUpNewLevel={levelUpNewLevel}
              currentSpellPick={currentSpellPick}
              spellPickQueue={spellPickQueue}
              spellPickIdx={spellPickIdx}
              spellPickSelected={spellPickSelected}
              onToggleSpell={toggleSpellSelection}
              onConfirm={handleSpellPickConfirm}
            />
          )}

          {phase === "done" && (
            <DonePhase
              characterName={characterName}
              levelUpNewLevel={levelUpNewLevel}
              xpGained={xpGained}
              campaignType={campaignType}
              campaignId={campaignId}
              onNewAdventure={() => router.push("/adventures")}
              onHome={() => router.push("/")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
