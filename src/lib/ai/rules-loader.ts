import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { GameContext, LocationType } from "@/lib/game/types";

const RULES_DIR = join(process.cwd(), "src/lib/rules");

type BooleanContextFlags = Omit<GameContext, "locationType">;

/** Map of boolean context flags to the rule files they require */
const CONTEXT_RULES: Record<keyof BooleanContextFlags, string[]> = {
  inCombat: ["combat.md"],
  inCharacterCreation: ["character-creation.md"],
  shopping: ["equipment.md"],
  exploring: ["exploration-mechanics.md", "running-adventures.md", "traps-and-hazards.md"],
  levelingUp: ["leveling.md"],
  casting: ["spellcasting-core.md"],
};

/** Files always loaded regardless of context */
const ALWAYS_LOAD = [
  "world.md",              // setting bible — tone, tech level, ancestries, gods, society
  "ability-scores.md",
  "deities.md",
  "light-and-darkness.md", // light/torch rules are critical every turn
  "gm-guidance.md",        // core ethos, DCs, NPCs, death, adventure completion
  "xp-awards.md",          // XP sources and treasure quality — relevant any session
  "carousing.md",          // downtime rules — GM may offer carousing any time in town
];

/**
 * Read a markdown rule file. Returns empty string if the file doesn't exist.
 */
function readRuleFile(filename: string): string {
  const filepath = join(RULES_DIR, filename);
  if (!existsSync(filepath)) {
    return "";
  }
  return readFileSync(filepath, "utf-8");
}

/**
 * Load the relevant Shadowdark rules based on the current game context.
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

  // Load the location-specific encounter table if exploring and a location type is set.
  if (context.exploring && context.locationType) {
    filesToLoad.add(`encounters/${context.locationType}.md`);
  }

  // Load only the spell tier files the character can actually access.
  // Shadowdark tier = ceil(level / 2). A level-1 char gets T1 only; level-5 gets T1–3.
  if (context.casting) {
    const maxTier = Math.ceil((characterLevel ?? 1) / 2);
    for (let t = 1; t <= maxTier; t++) {
      filesToLoad.add(`spellcasting-t${t}.md`);
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
