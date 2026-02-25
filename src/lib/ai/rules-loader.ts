import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { GameContext } from "@/lib/game/types";

const RULES_DIR = join(process.cwd(), "src/lib/rules");

/** Map of context flags to the rule files they require */
const CONTEXT_RULES: Record<keyof GameContext, string[]> = {
  inCombat: ["combat.md"],
  inCharacterCreation: ["character-creation.md"],
  shopping: ["equipment.md"],
  exploring: ["exploration.md"],
  levelingUp: ["leveling.md"],
  casting: ["spellcasting.md"],
};

/** Files always loaded regardless of context */
const ALWAYS_LOAD = [
  "ability-scores.md",
  "deities.md",
  "exploration.md", // rest rules are relevant everywhere, not just while exploring
  "gm-guidance.md", // carousing, DC table, core ethos — always relevant
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
 */
export function loadRules(context: GameContext): string {
  const filesToLoad = new Set<string>(ALWAYS_LOAD);

  for (const [flag, files] of Object.entries(CONTEXT_RULES)) {
    if (context[flag as keyof GameContext]) {
      for (const file of files) {
        filesToLoad.add(file);
      }
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
