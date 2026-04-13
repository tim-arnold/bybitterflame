import type { GameContext } from "@/lib/game/types";
import { RULE_FILES } from "@/lib/rules/bundle";

type BooleanContextFlags = Omit<GameContext, "locationType">;

/** Map of boolean context flags to the rule files they require */
const CONTEXT_RULES: Record<keyof BooleanContextFlags, string[]> = {
  inCombat: ["combat.md"],
  inCharacterCreation: ["character-creation.md"],
  shopping: ["equipment.md"],
  exploring: ["exploration-mechanics.md", "running-adventures.md", "traps-and-hazards.md"],
  levelingUp: ["leveling.md"],
  casting: ["spellcasting.md"],
};

/** Files always loaded regardless of context */
const ALWAYS_LOAD = [
  "world.md",              // setting — tone, tech level, ancestries, the Underways, folklore
  "ability-scores.md",
  "light-and-darkness.md", // light/torch rules are critical every turn
  "gm-guidance.md",        // core ethos, DCs, NPCs, death, Toll narration, adventure completion
  "xp-awards.md",          // XP sources and treasure quality — relevant any session
  "downtime.md",           // class-specific downtime activities — GM may offer any time in town
];

function readRuleFile(filename: string): string {
  return RULE_FILES[filename] ?? "";
}

/**
 * Load the relevant rules based on the current game context.
 * Returns a combined string of all applicable rule sections.
 *
 * @param context - Current game context flags
 * @param characterLevel - Character's current level (used to load only accessible spell tiers)
 */
export function loadRules(context: GameContext, characterLevel?: number): string {
  const filesToLoad = new Set<string>(ALWAYS_LOAD);

  for (const [flag, files] of Object.entries(CONTEXT_RULES)) {
    if (context[flag as keyof GameContext]) {
      for (const file of files) {
        filesToLoad.add(file);
      }
    }
  }

  // Load encounter design guidance when exploring.
  if (context.exploring) {
    filesToLoad.add("encounter-design.md");
  }

  // Load spell files based on character level.
  // Neutral spells (cantrips + T1) are always loaded when casting.
  // Path spell files (druid, sorcerer, enchanter) are loaded when the character
  // has access to T2+ spells (level 3+). All three paths are loaded since the
  // rules-loader doesn't currently know the character's specialization — the AI
  // only uses spells from the character's actual path.
  if (context.casting) {
    filesToLoad.add("spells-neutral.md");
    const level = characterLevel ?? 1;
    if (level >= 3) {
      filesToLoad.add("spells-druid.md");
      filesToLoad.add("spells-sorcerer.md");
      filesToLoad.add("spells-enchanter.md");
    }
  }

  const sections: string[] = [];

  for (const filename of filesToLoad) {
    const content = readRuleFile(filename);
    if (content) {
      sections.push(`--- ${filename.replace(".md", "").toUpperCase()} ---\n${content}`);
    }
  }

  if (sections.length === 0) {
    return "";
  }

  return `<rules>\n${sections.join("\n\n")}\n</rules>`;
}
