/**
 * Static imports for all rule files.
 * Webpack bundles these as raw strings (type: "asset/source"), making them available
 * in Cloudflare Workers where fs.readFileSync / process.cwd() don't work at runtime.
 */
import abilityScores from "./ability-scores.md";
import characterCreation from "./character-creation.md";
import combat from "./combat.md";
import downtime from "./downtime.md";
import encounterDesign from "./encounter-design.md";
import equipment from "./equipment.md";
import explorationMechanics from "./exploration-mechanics.md";
import gmGuidance from "./gm-guidance.md";
import leveling from "./leveling.md";
import lightAndDarkness from "./light-and-darkness.md";
import monsters from "./monsters.md";
import randomTables from "./random-tables.md";
import runningAdventures from "./running-adventures.md";
import spellcasting from "./spellcasting.md";
import spellsDruid from "./spells-druid.md";
import spellsEnchanter from "./spells-enchanter.md";
import spellsNeutral from "./spells-neutral.md";
import spellsSorcerer from "./spells-sorcerer.md";
import trapsAndHazards from "./traps-and-hazards.md";
import treasure from "./treasure.md";
import world from "./world.md";
import xpAwards from "./xp-awards.md";

export const RULE_FILES: Record<string, string> = {
  "ability-scores.md": abilityScores,
  "character-creation.md": characterCreation,
  "combat.md": combat,
  "downtime.md": downtime,
  "encounter-design.md": encounterDesign,
  "equipment.md": equipment,
  "exploration-mechanics.md": explorationMechanics,
  "gm-guidance.md": gmGuidance,
  "leveling.md": leveling,
  "light-and-darkness.md": lightAndDarkness,
  "monsters.md": monsters,
  "random-tables.md": randomTables,
  "running-adventures.md": runningAdventures,
  "spellcasting.md": spellcasting,
  "spells-druid.md": spellsDruid,
  "spells-enchanter.md": spellsEnchanter,
  "spells-neutral.md": spellsNeutral,
  "spells-sorcerer.md": spellsSorcerer,
  "traps-and-hazards.md": trapsAndHazards,
  "treasure.md": treasure,
  "world.md": world,
  "xp-awards.md": xpAwards,
};
