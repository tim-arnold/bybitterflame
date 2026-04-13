"use client";

import { useState } from "react";

type Combatant = {
  name: string;
  initiative: number;
  isPlayer: boolean;
  isCompanion?: boolean;
  isActive: boolean;
};

export interface CombatTrackerReturn {
  isInCombat: boolean;
  combatants: Combatant[];
  combatRound: number;
  applyCombatAction: (data: {
    active?: boolean;
    combatants?: Combatant[];
    round?: number;
  }) => void;
}

/** Manages combat state and applies combatAction updates from the GM. */
export function useCombatTracker(): CombatTrackerReturn {
  const [isInCombat, setIsInCombat] = useState(false);
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [combatRound, setCombatRound] = useState(1);

  function applyCombatAction(data: {
    active?: boolean;
    combatants?: Combatant[];
    round?: number;
  }) {
    if (data.active !== undefined) {
      setIsInCombat(data.active);
      if (!data.active) {
        setCombatants([]);
        setCombatRound(1);
      }
    }
    if (data.combatants) setCombatants(data.combatants);
    if (data.round) setCombatRound(data.round);
  }

  return { isInCombat, combatants, combatRound, applyCombatAction };
}
