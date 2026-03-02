/**
 * Static imports for all rule files.
 * Webpack bundles these as raw strings (type: "asset/source"), making them available
 * in Cloudflare Workers where fs.readFileSync / process.cwd() don't work at runtime.
 */
import abilityScores from "./ability-scores.md";
import carousing from "./carousing.md";
import characterCreation from "./character-creation.md";
import combat from "./combat.md";
import deities from "./deities.md";
import equipment from "./equipment.md";
import explorationMechanics from "./exploration-mechanics.md";
import gmGuidance from "./gm-guidance.md";
import leveling from "./leveling.md";
import lightAndDarkness from "./light-and-darkness.md";
import monsters from "./monsters.md";
import randomTables from "./random-tables.md";
import runningAdventures from "./running-adventures.md";
import spellcastingCore from "./spellcasting-core.md";
import spellcastingT1 from "./spellcasting-t1.md";
import spellcastingT2 from "./spellcasting-t2.md";
import spellcastingT3 from "./spellcasting-t3.md";
import spellcastingT4 from "./spellcasting-t4.md";
import spellcastingT5 from "./spellcasting-t5.md";
import trapsAndHazards from "./traps-and-hazards.md";
import treasure from "./treasure.md";
import world from "./world.md";
import xpAwards from "./xp-awards.md";

// Encounter tables
import encounterArctic from "./encounters/arctic.md";
import encounterArtisanDistrict from "./encounters/artisan-district.md";
import encounterCave from "./encounters/cave.md";
import encounterDesert from "./encounters/desert.md";
import encounterForest from "./encounters/forest.md";
import encounterGrassland from "./encounters/grassland.md";
import encounterHighDistrict from "./encounters/high-district.md";
import encounterJungle from "./encounters/jungle.md";
import encounterLowDistrict from "./encounters/low-district.md";
import encounterMarket from "./encounters/market.md";
import encounterMountain from "./encounters/mountain.md";
import encounterOcean from "./encounters/ocean.md";
import encounterRiverAndCoast from "./encounters/river-and-coast.md";
import encounterRuins from "./encounters/ruins.md";
import encounterSlums from "./encounters/slums.md";
import encounterSwamp from "./encounters/swamp.md";
import encounterTavern from "./encounters/tavern.md";
import encounterTempleDistrict from "./encounters/temple-district.md";
import encounterTomb from "./encounters/tomb.md";
import encounterUniversityDistrict from "./encounters/university-district.md";

export const RULE_FILES: Record<string, string> = {
  "ability-scores.md": abilityScores,
  "carousing.md": carousing,
  "character-creation.md": characterCreation,
  "combat.md": combat,
  "deities.md": deities,
  "equipment.md": equipment,
  "exploration-mechanics.md": explorationMechanics,
  "gm-guidance.md": gmGuidance,
  "leveling.md": leveling,
  "light-and-darkness.md": lightAndDarkness,
  "monsters.md": monsters,
  "random-tables.md": randomTables,
  "running-adventures.md": runningAdventures,
  "spellcasting-core.md": spellcastingCore,
  "spellcasting-t1.md": spellcastingT1,
  "spellcasting-t2.md": spellcastingT2,
  "spellcasting-t3.md": spellcastingT3,
  "spellcasting-t4.md": spellcastingT4,
  "spellcasting-t5.md": spellcastingT5,
  "traps-and-hazards.md": trapsAndHazards,
  "treasure.md": treasure,
  "world.md": world,
  "xp-awards.md": xpAwards,
  "encounters/arctic.md": encounterArctic,
  "encounters/artisan-district.md": encounterArtisanDistrict,
  "encounters/cave.md": encounterCave,
  "encounters/desert.md": encounterDesert,
  "encounters/forest.md": encounterForest,
  "encounters/grassland.md": encounterGrassland,
  "encounters/high-district.md": encounterHighDistrict,
  "encounters/jungle.md": encounterJungle,
  "encounters/low-district.md": encounterLowDistrict,
  "encounters/market.md": encounterMarket,
  "encounters/mountain.md": encounterMountain,
  "encounters/ocean.md": encounterOcean,
  "encounters/river-and-coast.md": encounterRiverAndCoast,
  "encounters/ruins.md": encounterRuins,
  "encounters/slums.md": encounterSlums,
  "encounters/swamp.md": encounterSwamp,
  "encounters/tavern.md": encounterTavern,
  "encounters/temple-district.md": encounterTempleDistrict,
  "encounters/tomb.md": encounterTomb,
  "encounters/university-district.md": encounterUniversityDistrict,
};
