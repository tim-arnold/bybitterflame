import type { AdventureCollection } from "./types";

export const SHOTS_IN_THE_DARK_1: AdventureCollection = {
  id: "shots-in-the-dark-1",
  title: "Shots in the Dark #1",
  adventures: [
    {
      id: "creeping-spore",
      title: "The Creeping Spore",
      levelMin: 1,
      levelMax: 1,
      synopsis:
        "Strange fungal spores seep from the town's storm drains, driving those exposed to madness. The town council offers a reward for anyone brave enough to descend into the tunnels beneath the cobbles and destroy the source.",
      hook: "Unsettling spores have begun seeping from the town's storm drains, causing hallucinations and violent madness in those exposed. The council is offering 50gp for any bold soul willing to investigate.",
      pcMapFile: "Spores-Undercity-PC.webp",
      mapLayout:
        "TWO-LEVEL DUNGEON connected by a central staircase (map has two panels; N = up). UPPER LEVEL (top panel): The sewer complex. A long west entry corridor (~40 ft long × 20 ft wide, the drain pipe) leads east into a rounded antechamber (~20×20 ft), then into the main sewer hall (~80×80 ft rectangular) with a central raised disc feature. The hall has: a north corridor (~20 ft) to a small round alcove room; an east wing with a large columned storage room (~30×40 ft) and a smaller locked side chamber to the far east; and two utility side-rooms to the south (~20×30 ft each with furnishings). LOWER LEVEL (bottom panel): Reached via a staircase descending from the main upper hall. The Spore Garden: a large circular cave chamber (~100 ft diameter) with the Mycelial Core glowing at center. A west cave passage (~30 ft) leads to Wren's Camp alcove. An east cave passage (~40 ft) is partially flooded. North is up.",
      locations: [
        {
          id: "drain-entry",
          name: "The Drain Entry",
          description:
            "A stench-filled storm drain grate at the edge of the merchant quarter. The iron grate can be forced open (STR DC 12) or unlocked with a key taken from the sewer watchman's body.",
          mapPosition: "Upper level, western entry — the drain grate is at the far west end",
          dimensions: "Entry drain corridor ~40 ft long × 20 ft wide; rounded antechamber ~20×20 ft",
          connections: [
            "West: iron drain grate to the street surface (forced open STR DC 12, or sewer watchman's key)",
            "East: archway into the main sewer hall (~30 ft to hall center)",
            "South (from antechamber): locked iron door to a small utility side-room",
          ],
          hazards: ["Spore cloud: characters without a wet cloth over their face must make CON DC 10 or suffer -1 to INT for 1 hour"],
          hasPcMap: true,
          locationType: "cave",
        },
        {
          id: "spore-garden",
          name: "The Spore Garden",
          description:
            "A vast underground chamber carpeted in luminous fungal blooms. The spores fill the air in thick clouds. The source of the town's contamination lies here — a cracked mycelial node the size of a wagon wheel.",
          mapPosition: "Lower level, large circular cave chamber, reached via staircase from the upper sewer hall",
          dimensions: "~100 ft diameter circular cave; west passage ~30 ft; east passage ~40 ft (partially flooded)",
          connections: [
            "North: staircase up to the main upper sewer hall (~15 ft vertical descent)",
            "West: cave passage to Wren's Camp (~30 ft)",
            "East: flooded cave passage (partially submerged, ~40 ft, dead end)",
            "Center: the Mycelial Core glows at the chamber's heart (~50 ft from any wall)",
          ],
          hazards: ["Fungal seed infection: any character entering without protection must make CON DC 12 or begin 7-day gestation toward fungal transformation"],
          hasPcMap: true,
          locationType: "cave",
        },
        {
          id: "wrens-camp",
          name: "Wren's Camp",
          description:
            "A dry alcove off the main fungal chamber, cluttered with alchemical equipment and hanging dried herbs. Wren Mossheart, a hedge-witch, has been living here studying the spores — she didn't intend to contaminate the town above.",
          mapPosition: "Lower level, western alcove off the Spore Garden",
          dimensions: "~20×30 ft dry alcove; noticeably drier and cleaner than the main cave",
          connections: [
            "East: open passage back to the Spore Garden (~30 ft to cave center)",
          ],
          npcs: ["Wren Mossheart, hedge-witch (neutral, territorial but not malicious)"],
          locationType: "cave",
        },
        {
          id: "mycelial-core",
          name: "The Mycelial Core",
          description:
            "The cracked node at the chamber's heart, pulsing with sickly bioluminescent light. Destroying it (dealing 20 damage or pouring alchemical fire on it) stops the spore contamination — but triggers a violent spore eruption as it dies.",
          mapPosition: "Lower level, center of the Spore Garden circular chamber",
          dimensions: "The cracked node is wagon-wheel sized; the open cave around it extends ~50 ft in every direction",
          connections: [
            "Surrounded by open cave floor; all parts of the Spore Garden are within 50 ft",
          ],
          hazards: ["Dying core eruption: all creatures within Near range make CON DC 14 or take 2d6 poison damage"],
          locationType: "cave",
        },
      ],
      keyNPCs: [
        "Wren Mossheart (hedge-witch): Neutral but territorial; has been studying the spores for weeks; can direct the party to the core. Can be persuaded with gold or flattery. Knows a poultice recipe that grants advantage on CON saves vs. spore infection.",
      ],
      specialMechanics: [
        "Fungal Infection: Any character exposed in the Spore Garden (without protection) must make CON DC 12 each day or progress one step toward fungal transformation. After 7 days at the final stage, transformation is complete. Cure: destroy the Mycelial Core, or Wren's antidote poultice.",
      ],
    },
    {
      id: "drowned-barrow",
      title: "The Drowned Barrow",
      levelMin: 1,
      levelMax: 2,
      synopsis:
        "An old family barrow has flooded with brackish water from an underground spring, disturbing the restless dead within. Tomb robbers sent to retrieve a family heirloom never returned — now the family is offering a reward.",
      hook: "The Ashvane family barrow has flooded after a spring burst through its foundation. Their hired delvers vanished inside. The family matriarch will pay 75gp for the safe return of the Ashvane signet ring — and begs that their ancestors be laid to rest.",
      pcMapFile: "Flooded-Crypt-VTT-PC-22x14.webp",
      mapLayout:
        "A single-level rectangular barrow (22×14 grid = 220×140 ft total). ENTRANCE (west): Stone stairs descend from ground level into the barrow's western end. A short entry passage (~10 ft wide) leads east. ANTECHAMBER (center): The main hall (~80×60 ft) runs east-west through the center of the barrow. Standing water fills the hall; four raised sarcophagus platforms stand above the waterline on stone plinths. Burial alcoves line the north and south walls. Iron door at the east end leads deeper. FLOODED VAULT (east): The eastern chamber (~60×80 ft) is fully submerged. A stone pedestal stands at the far east end. The Ashvane Wight guards this space. THE SPRING SOURCE: A crack in the east wall at floor level. North is up.",
      locations: [
        {
          id: "barrow-entrance",
          name: "Barrow Entrance",
          description:
            "Stone steps descend into knee-deep black water. The smell of rot and standing water fills the air. Waterlogged torches in iron sconces flicker weakly.",
          mapPosition: "Western end of the barrow; the staircase descends from ground level",
          dimensions: "Entry landing ~20×20 ft; stairs ~10 ft wide",
          connections: [
            "West: stone stairs up to ground level and the Ashvane family mound above",
            "East: archway into the Antechamber (~10 ft)",
          ],
          hasPcMap: true,
          locationType: "tomb",
        },
        {
          id: "antechamber",
          name: "The Antechamber",
          description:
            "A wide room with carved stone reliefs depicting the Ashvane family's history. The water here reaches waist-deep on a human. Four raised sarcophagi stand above the waterline.",
          mapPosition: "Central section of the barrow, running east-west",
          dimensions: "~80×60 ft; four raised sarcophagus platforms (each ~5×8 ft) above waterline; burial alcoves ~10×10 ft along north and south walls",
          connections: [
            "West: archway to the Barrow Entrance (~10 ft)",
            "North wall: three burial alcoves (sealed, undisturbed)",
            "South wall: three burial alcoves (sealed, undisturbed)",
            "East: iron door (~10 ft wide) into the Flooded Vault — water depth increases sharply here",
          ],
          npcs: ["Three animated skeletons of Ashvane soldiers — hostile"],
          hazards: ["Waist-deep water: movement costs double, DEX-based attacks at disadvantage"],
          locationType: "tomb",
        },
        {
          id: "flooded-vault",
          name: "The Flooded Vault",
          description:
            "The deepest chamber, entirely submerged. The Ashvane signet ring lies on a pedestal at the far end — next to the bloated corpse of one of the missing tomb robbers, now animated as a waterlogged wight.",
          mapPosition: "Eastern end of the barrow; fully submerged beyond the iron door",
          dimensions: "~60×80 ft; stone pedestal at the far east end; ceiling height ~10 ft (no air gap — completely underwater)",
          connections: [
            "West: iron door back to the Antechamber (~10 ft — the threshold where depth becomes full submersion)",
            "East wall: The Spring Source crack at floor level",
          ],
          npcs: ["Ashvane Wight (Level 3 undead, can only be harmed by silver, fire, or magic)"],
          hazards: ["Fully submerged: characters must hold breath (CON rounds) or begin drowning. Constitution saves every round after."],
          locationType: "tomb",
        },
        {
          id: "spring-source",
          name: "The Spring Source",
          description:
            "A cracked wall in the back of the flooded vault where the underground spring enters. Plugging the crack (STR DC 15 or magical means) will slowly drain the barrow over 10 minutes.",
          mapPosition: "Far east wall of the Flooded Vault, at floor level",
          dimensions: "A 2-ft crack in the stone at floor level; water pours through at low pressure",
          connections: [
            "Located within the Flooded Vault — no separate chamber; plugging it begins draining the entire barrow",
          ],
          locationType: "tomb",
        },
      ],
      keyNPCs: [
        "Lady Mira Ashvane: Elderly family matriarch; hires the party; insists her ancestors be given proper rest (i.e., the wight destroyed, not just avoided).",
        "Ashvane Wight: The risen corpse of the head tomb robber, empowered by the disturbed family spirits; wears the robber's gear and the Ashvane signet ring around its neck.",
      ],
      specialMechanics: [
        "Underwater Combat: All attacks in fully submerged areas have disadvantage unless the attacker has a swimming speed. Spells with verbal components require a CON DC 12 check or fail.",
        "Drowning: Characters holding their breath may do so for CON rounds. On failure, they begin drowning and take 1d6 damage per round.",
      ],
    },
    {
      id: "hungry-garden",
      title: "The Hungry Garden",
      levelMin: 1,
      levelMax: 2,
      synopsis:
        "A once-celebrated botanical garden has been consumed by a monstrous carnivorous plant called the Bloodbloom. Villagers who tried to burn it have vanished. A herbalist desperately needs a rare blossom from the garden's heart.",
      hook: "The village herbalist, old Torben, needs a Moonbloom flower from the estate gardens to cure a plague spreading through the village — but the gardens have become a nightmare of carnivorous growth and missing people.",
      pcMapFile: "Rotting-Gardens-Rafflesia-PC.webp",
      mapLayout:
        "An outdoor garden estate shown in isometric perspective (not a precise grid; approximate distances only). ENTRANCE (south): An iron arch gate hung with rose vines and skulls opens onto a stone path leading north. WEST GARDEN: A sunken rose garden with a tall stone obelisk/spike; carnivorous plants fill the beds and paths. EAST TERRACE: A raised stone terrace with weathered statues and a ritual altar; stone steps connect it to the central path. OLD GREENHOUSE (center-west, along the path): A shattered glass structure (~40×30 ft) choked with vines; the cocooned villagers are inside. BLOODBLOOM HEART (north-center): The ancient Bloodbloom (~10 ft diameter) dominates the garden's north end. The Moonbloom Hollow is beneath its root mass. The map is illustrative art — exact room sizes are approximate. North is toward the top of the image.",
      locations: [
        {
          id: "garden-gate",
          name: "The Garden Gate",
          description:
            "Rusted iron gates hang open. The path beyond is choked with twisted vines and enormous flytraps the size of dogs. The stench of rotting flesh drifts on a warm wind.",
          mapPosition: "Southern entrance of the garden complex",
          dimensions: "Stone arch ~15 ft wide; the central garden path runs ~150 ft north to the Bloodbloom",
          connections: [
            "South: surface road leading to the village (~10 min walk)",
            "North: central garden path through the Inner Grove (~60 ft to the Greenhouse, ~150 ft to the Bloodbloom Heart)",
            "West: sunken rose garden (vine-choked, difficult terrain)",
            "East: raised stone terrace (steps up ~3 ft)",
          ],
          hazards: ["Vine tendrils: DEX DC 12 to move through without triggering a grapple (STR 14, deals 1d4 constriction per round)"],
          hasPcMap: true,
          locationType: "ruins",
        },
        {
          id: "greenhouse",
          name: "The Old Greenhouse",
          description:
            "A shattered glass structure, now overgrown. The missing villagers are here — three of them, cocooned in plant matter but still alive. Saving them requires cutting through the vines (dealing 15 damage to the cocoon) without harming the occupant.",
          mapPosition: "Center-west of the garden, along the main path (~60 ft north of the gate)",
          dimensions: "~40×30 ft shattered glass structure; interior heavily overgrown",
          connections: [
            "South: garden path back to the Gate (~60 ft)",
            "North: overgrown path continuing to the Bloodbloom Heart (~90 ft)",
            "East: garden path to the east terrace (~30 ft)",
          ],
          npcs: ["Three cocooned villagers (unconscious but alive)"],
          locationType: "ruins",
        },
        {
          id: "bloodbloom-heart",
          name: "The Bloodbloom Heart",
          description:
            "The center of the garden, dominated by an enormous fleshy bloom ten feet across. The Bloodbloom is the size of a draft horse and is semi-intelligent — it attacks anything that enters its reach. The Moonbloom grows in a sheltered hollow beneath it.",
          mapPosition: "North-center of the garden at the end of the main path",
          dimensions: "The Bloodbloom is ~10 ft across; its attack reach extends 15 ft in all directions",
          connections: [
            "South: main garden path back toward the Greenhouse (~90 ft)",
            "West: sunken rose garden (heavy vines, difficult terrain)",
            "East: raised stone terrace (~20 ft, statues and altar)",
            "Beneath (ground level): the Moonbloom Hollow is accessible under the Bloodbloom's root mass",
          ],
          npcs: ["The Bloodbloom (giant carnivorous plant, Level 3, reach attack, can swallow small creatures)"],
          hazards: ["Corpse-stench aura: characters within Near range must make CON DC 10 at the start of each turn or be Sickened (disadvantage on attacks) for 1 round"],
          locationType: "ruins",
        },
        {
          id: "moonbloom-hollow",
          name: "The Moonbloom Hollow",
          description:
            "Beneath the Bloodbloom, sheltered from the rot, a cluster of pale silver flowers blooms in a patch of clean soil. One bloom is enough for Torben's cure.",
          mapPosition: "At ground level beneath the Bloodbloom's root mass, north-center of the garden",
          dimensions: "A sheltered hollow ~5 ft across; accessible only by moving within the Bloodbloom's reach",
          connections: [
            "Only accessible from within the Bloodbloom's 15-ft reach zone; requires approaching the bloom directly",
          ],
          locationType: "ruins",
        },
      ],
      keyNPCs: [
        "Torben (Herbalist): Desperate, elderly, will trade potions for help; knows the Bloodbloom's weakness — it is vulnerable to fire and salt.",
        "The Bloodbloom: Semi-intelligent plant entity; it has been growing since the estate owner died and left the garden to ruin; not truly evil, just hungry and territorial.",
      ],
      specialMechanics: [
        "Plant Grapple: Many plants in the garden can grapple. A grappled character is pulled 5 feet toward the plant each round (no save) until they break free (STR DC 12) or the plant is destroyed.",
        "Bloodbloom Swallow: On a natural 18-20 attack, the Bloodbloom swallows a Small or smaller creature. Inside: 2d6 acid damage per round, STR DC 14 to break free.",
      ],
    },
    {
      id: "blackbridge-maze",
      title: "The Blackbridge Maze",
      levelMin: 2,
      levelMax: 3,
      synopsis:
        "Beneath a crumbling black stone bridge lies a maze built by a mad architect centuries ago. A merchant's son vanished exploring it on a dare. The maze still shifts — walls slide and doors lock themselves.",
      hook: "Young Edric Thorne went exploring the legendary shifting maze beneath Blackbridge and hasn't returned in three days. His father, a wealthy merchant, offers 150gp for Edric alive — or 50gp for his signet ring.",
      pcMapFile: "Blackbridge-Labyrinth-PC.webp",
      mapLayout:
        "A multi-zone labyrinth beneath the bridge (north = up). ENTRANCE TOWER (upper-left): A stone tower at the bridge's northern base with a portcullis and descending stairs; the iron door opens south into the maze antechamber. THE MAZE (center-left): A dense network of 10-ft-wide shifting stone corridors occupying ~120×100 ft. No single straight path traverses it; corridors dead-end and reconnect. THE CHAMBER OF MIRRORS (lower-center): Three connected circular alcoves (~20 ft diameter each) joined by short passages at the maze's southern end; walls entirely black glass. EDRIC'S PRISON (lower-right): A small rectangular locked room (~20×20 ft) accessible from the mirror chamber or maze's southeast corner. THE ARCHITECT'S VAULT (upper-right): A large circular chamber (~60 ft diameter) connected to the maze's east side by a narrow 10-ft corridor; the sarcophagus stands at center. Note: the maze physically shifts every 10 exploration turns — corridors that existed before may be closed or rerouted.",
      locations: [
        {
          id: "maze-entrance",
          name: "The Maze Entrance",
          description:
            "An iron door set into the base of the bridge's central pillar, unlocked and slightly ajar. The air inside smells of old stone and something metallic. Geometric patterns are carved into every surface.",
          mapPosition: "Upper-left of the labyrinth; the entry tower at the bridge's north base",
          dimensions: "Entry antechamber ~20×20 ft; portcullis above, iron door to the south",
          connections: [
            "North: iron portcullis and stairs up to the underside of Blackbridge (surface access)",
            "South: iron door opening into the Shifting Corridors of the maze (~10 ft passage)",
          ],
          hasPcMap: true,
          locationType: "ruins",
        },
        {
          id: "shifting-corridors",
          name: "Shifting Corridors",
          description:
            "Narrow stone passages that rearrange themselves every hour on the hour (marked by a deep grinding sound). Characters must make INT DC 12 to maintain their sense of direction after a shift, or become lost.",
          mapPosition: "Central-left section of the labyrinth; the bulk of the dungeon",
          dimensions: "~120×100 ft area of interlocking 10-ft-wide corridors; shifts every 10 exploration turns",
          connections: [
            "North: back to the Maze Entrance antechamber",
            "East: narrow 10-ft corridor to The Architect's Vault (may shift — INT DC 12 to relocate after a shift)",
            "South: to The Chamber of Mirrors",
            "Southeast: to Edric's Holding Chamber",
          ],
          hazards: ["Maze shift: every 10 exploration turns, roll d6. On 1-2, the maze shifts — all doors reset, exits relocate. Lost characters wander for 1d4 turns before finding a landmark."],
          locationType: "ruins",
        },
        {
          id: "mirror-chamber",
          name: "The Chamber of Mirrors",
          description:
            "A large room walled entirely in black glass. The reflections are wrong — they move independently and whisper. One of the mirrors is a portal to the puzzle room. A maze-guardian golem patrols here.",
          mapPosition: "Lower-center of the labyrinth, south end of the maze",
          dimensions: "Three circular alcoves ~20 ft diameter each, connected by 10-ft passages; total footprint ~60×30 ft",
          connections: [
            "North: passage back into the Shifting Corridors",
            "East: short passage (~20 ft) to Edric's Holding Chamber",
            "One mirror (WIS DC 13 or INT DC 14 to identify): portal directly to the Architect's Vault",
          ],
          npcs: ["Stone Maze-Guardian (Level 3 construct; immune to fire and poison; stops when the architect's key is presented)"],
          locationType: "ruins",
        },
        {
          id: "edrics-prison",
          name: "Edric's Holding Chamber",
          description:
            "A locked room deep in the maze where Edric has been trapped. He's hungry and frightened but unharmed. The door lock requires solving a number-pattern puzzle carved in the wall (INT DC 14, or find the solution scrawled on a note in the mirror chamber).",
          mapPosition: "Lower-right of the labyrinth, southeast of the Mirror Chamber",
          dimensions: "~20×20 ft locked stone room; single iron door on the west wall",
          connections: [
            "West: locked iron door back to the Mirror Chamber / Shifting Corridors (~20 ft; puzzle lock INT DC 14)",
          ],
          npcs: ["Edric Thorne (young merchant's son, unharmed, frightened)"],
          locationType: "ruins",
        },
        {
          id: "architects-vault",
          name: "The Architect's Vault",
          description:
            "The maze's central chamber with a sarcophagus of the mad architect, Corvus Weft. His key (disables the guardian) and his journal (explains the maze logic) are here, along with 300gp in old coin.",
          mapPosition: "Upper-right of the labyrinth, east of the main maze",
          dimensions: "~60 ft diameter circular chamber; sarcophagus at center; geometric carvings on every surface",
          connections: [
            "West: narrow 10-ft corridor back into the Shifting Corridors (~30 ft; may shift — corridor may be hard to find again after a maze shift)",
          ],
          locationType: "ruins",
        },
      ],
      keyNPCs: [
        "Edric Thorne: Pampered merchant's son; terrified but alive; will follow any rescuer out without complaint.",
        "Maze-Guardian: An ancient stone construct animated by the architect; not truly hostile — it only attacks those who threaten the vault. Will stand down if the architect's key is shown.",
      ],
      specialMechanics: [
        "Maze Navigation: Track exploration turns. Every 10 turns, roll d6 — on 1-2 the maze shifts. Characters must make INT DC 12 after a shift or spend 1d4 turns lost before finding a recognizable landmark.",
        "Puzzle Lock: The holding chamber door requires either solving the carved puzzle (INT DC 14, 10-minute attempt) or finding the solution note in the mirror chamber first.",
      ],
    },
    {
      id: "blight-of-ironhaunt",
      title: "The Blight of Ironhaunt",
      levelMin: 3,
      levelMax: 4,
      synopsis:
        "The iron keep of Ironhaunt fell to a demonic curse three generations ago. Now the curse has begun spreading to the surrounding farmland. The Iron Hand wardens have tasked adventurers with entering the keep, descending to its cursed well, and sealing it.",
      hook: "Crops around the old iron keep are rotting on the vine, and livestock are born wrong. The Iron Hand wardens believe the Doom Well beneath Ironhaunt has begun to overflow its binding. They'll pay 300gp to see it sealed.",
      pcMapFile: "Doom-Cear-Ferros-PC-main.webp",
      mapLayout:
        "TWO-LEVEL DUNGEON: keep above, sealed well chamber below. KEEP LEVEL (main map, north = up): A large rectangular iron keep (~80×120 ft) set into rocky terrain. The approach is from the west through a gatehouse entry with portcullis. COURTYARD: the open grounds between the outer gate and the keep entrance; iron trees line the path (~40×60 ft open area). GREAT HALL: the keep's large central chamber (~60×50 ft) with a long stone table and a ritual circle on the floor. Northern interior rooms: smaller barracks and storage chambers accessible via north doorways. NW tower (~20×20 ft): a watchtower with interior stairs. SE corner: a spiral staircase descending to the Doom Well level. East exterior: additional tower rooms with murder-holes (the sentinels patrol between these). WELL LEVEL (well map): A single chamber (~80×60 ft) reached via the spiral stair. The massive iron well stands at the center, surrounded by a carved binding-circle floor pattern. The two dashed circles on the well map indicate the well mouth and the ritual boundary. North is up.",
      locations: [
        {
          id: "keep-courtyard",
          name: "Keep Courtyard",
          description:
            "The overgrown courtyard of Ironhaunt. Iron trees (their leaves hammered metal) line the path to the keep. Three demonic sentinels — former soldiers bound to the keep forever — patrol in a fixed pattern.",
          mapPosition: "Exterior grounds and gatehouse; western approach between outer gate and keep entrance",
          dimensions: "Courtyard ~40×60 ft open area; gatehouse entry arch ~15 ft wide; outer perimeter wall ~5 ft thick",
          connections: [
            "West: outer iron gate leading to the surrounding farmlands (the sentinels cannot pass this threshold)",
            "East: iron keep entrance doors (~15 ft wide) leading into the Great Hall",
            "North and south: exterior walls with murder-hole towers",
            "Sentinel patrol path: a triangle between the gate, the north tower corner, and the south tower corner",
          ],
          npcs: ["Three Bound Iron Sentinels (Level 3 undead-fiend hybrids; cannot leave the keep grounds)"],
          hasPcMap: true,
          locationType: "ruins",
        },
        {
          id: "great-hall",
          name: "The Blighted Great Hall",
          description:
            "Once a feasting hall, now a tomb. The long table is set with the rotted remains of a last feast, the silverware corroded black. A demon lieutenant named Vassek holds court here, toying with a captive scholar.",
          mapPosition: "Central chamber of the iron keep",
          dimensions: "~60×50 ft long hall; long stone table runs east-west through center; raised dais at north end",
          connections: [
            "West: iron keep entrance doors to the Keep Courtyard",
            "North: doorways to northern barracks and storage rooms (~20×20 ft each)",
            "South corridor: 10-ft passage leading to the spiral staircase to the Doom Well (~30 ft)",
            "East: archway to the NE tower rooms and murder-hole positions",
            "Northwest: door to the NW watchtower (~20×20 ft, stairs up)",
          ],
          npcs: ["Vassek, Demon Lieutenant (Level 4 fiend; immune to fire; can be bargained with — will release the scholar for the party's promise to leave the well alone)"],
          locationType: "ruins",
        },
        {
          id: "doom-well",
          name: "The Doom Well",
          description:
            "A spiral stair descends to a circular chamber dominated by a massive iron well. The well's water is solid black and radiates intense cold. Sealing it requires pouring a vial of consecrated water into the well while reciting the Iron Hand's binding chant — then surviving the doom spirit that erupts from it.",
          mapPosition: "Below the keep, accessed via spiral stair from the Great Hall's south corridor",
          dimensions: "Well chamber ~80×60 ft; the iron well at center is ~10 ft diameter; carved binding-circle fills the floor (~20 ft radius around the well)",
          connections: [
            "North: spiral staircase up to the Great Hall south corridor (~30 ft vertical ascent)",
            "The well is the sole feature; the binding-circle surrounds it; no other exits",
          ],
          hazards: ["Doom aura: characters within Near range take 1 cold damage per round and must make WIS DC 12 or suffer -1 to their next attack roll (the Doom whispers despair)"],
          hasPcMap: true,
          locationType: "ruins",
        },
        {
          id: "spirit-chamber",
          name: "The Spirit Chamber",
          description:
            "As the well is sealed, the Doom Spirit — a massive shadow entity bound to this place — erupts from the water for one final confrontation before being sealed away forever.",
          mapPosition: "Same chamber as the Doom Well — the Spirit erupts from the well when the ritual begins",
          dimensions: "The entire well chamber (~80×60 ft) becomes the combat space; the Spirit cannot leave the keep grounds",
          connections: [
            "Same as Doom Well; the Spirit fills the chamber when it erupts; the staircase north is the only exit",
          ],
          npcs: ["The Doom Spirit (Level 5 shadow; immune to non-magical weapons; destroyed when well is sealed, not before)"],
          locationType: "ruins",
        },
      ],
      keyNPCs: [
        "Vassek (Demon Lieutenant): Arrogant but tactical; will deal if the party seems strong enough to threaten him; secretly fears the Doom Spirit and doesn't want it released.",
        "Scholar Pen Drell: Captive historian studying the keep; has a copy of the binding chant and a vial of consecrated water; wants to be rescued.",
        "The Doom Spirit: The ancient evil bound to the well; it cannot leave the keep; it will beg, bargain, and threaten as it is sealed away.",
      ],
      specialMechanics: [
        "Binding Ritual: To seal the well, the party must pour consecrated water into it AND recite the binding chant (takes 2 full rounds, cannot be interrupted without restarting). The Doom Spirit erupts on round 1 of the ritual and attacks until slain or the ritual completes.",
        "Sentinel Pattern: The courtyard sentinels follow a fixed patrol pattern. With a successful INT DC 10, the party can observe the pattern and move past safely.",
      ],
    },
    {
      id: "unbound-tower",
      title: "The Unbound Tower",
      levelMin: 2,
      levelMax: 3,
      synopsis:
        "A young caster's summoning experiment went catastrophically wrong, binding four elementals to four floors of a tower and sealing all the exits. The caster is trapped inside. The tower's owner wants it cleared — and the caster retrieved.",
      hook: "Smoke pours from the windows of Teldris's Tower and strange lights flash within. The caster's apprentice ran out screaming about 'elementals everywhere.' The tower owner is offering 200gp to clear the mess and retrieve young Teldris alive.",
      pcMapFile: "Elemental-Mistakes-VTT-PC-12x41.webp",
      mapLayout:
        "A four-story circular tower (~60 ft diameter per floor, total height ~50 ft above ground). The map shows all four floors stacked vertically (ground at bottom, roof at top). Each floor is connected by a central spiral staircase that runs through all levels. A secondary map (Elemental-Mistakes-Stairs-PC.png) shows the staircase cross-section. FLOOR 1 - GROUND (Earth Elemental): Entry door on the ground-level exterior wall (south or west face); the floor has erupted with stone and earth — rubble fills the corners. The caster's desk is buried in the southwest quadrant. The earth elemental circles the staircase. FLOOR 2 (Water Elemental): Ankle-deep water covers the entire floor; a potions lab lines the east wall; windows on two sides. FLOOR 3 (Air Elemental): Windows blown out on east and west; furniture caught in a vortex; Teldris is tied near the north wall. ROOF (Fire Elemental): Open circular platform; the master summoning circle is chalked near center, half-burned. North is up.",
      locations: [
        {
          id: "tower-base",
          name: "Tower Base — Earth Elemental",
          description:
            "The ground floor, half-buried in stone and earth that have erupted through the floor. An earth elemental circles the staircase to the second floor, unable to move past it but blocking all passage.",
          mapPosition: "Ground floor (Floor 1) of the tower",
          dimensions: "~60 ft diameter circular floor; ceiling height ~12 ft; staircase at center-north",
          connections: [
            "Exterior: main entry door to outside grounds (south or west face of tower)",
            "Up: spiral staircase to Second Floor (~12 ft vertical; the earth elemental blocks this route)",
          ],
          npcs: ["Earth Elemental (Level 3; immune to non-magical bludgeoning; can be dismissed by reading the banishment scroll found in the caster's desk — buried under rubble, INT DC 13 to locate)"],
          hasPcMap: true,
          locationType: "ruins",
        },
        {
          id: "tower-second",
          name: "Second Floor — Water Elemental",
          description:
            "Ankle-deep water covers the floor; the walls weep and the ceiling drips. A water elemental occupies the stairwell, flowing through cracks. The caster's potions lab is here — potions float in the water.",
          mapPosition: "Second floor of the tower, directly above the ground floor (~12 ft up)",
          dimensions: "~60 ft diameter circular floor; ankle-deep water throughout; potions lab along the east wall",
          connections: [
            "Down: spiral staircase to Ground Floor (~12 ft; water elemental flows through cracks here)",
            "Up: spiral staircase to Third Floor (~12 ft)",
            "Windows: two window openings (~15 ft above ground; water streams out)",
          ],
          npcs: ["Water Elemental (Level 3; can move through cracks; vulnerable to lightning; can be dismissed by the banishment scroll or redirected through the window with a successful WIS DC 14)"],
          locationType: "ruins",
        },
        {
          id: "tower-third",
          name: "Third Floor — Air Elemental",
          description:
            "Windows blown out, furniture spinning in a vortex. The wind is strong enough to push a creature off the tower (STR DC 12 or be flung through the window — 30 foot drop). Teldris is tied to a chair here, spinning.",
          mapPosition: "Third floor of the tower; windows blown out on east and west faces (~30 ft above ground)",
          dimensions: "~60 ft diameter circular floor; two blown-out window openings; 30-ft drop to ground outside",
          connections: [
            "Down: spiral staircase to Second Floor (~12 ft)",
            "Up: spiral staircase to the Roof (~12 ft)",
            "Windows (blown out, east and west): 30-ft drop to ground — wind vortex pushes creatures toward openings (STR DC 12 to resist)",
          ],
          npcs: ["Air Elemental (Level 3; immune to thunder; vulnerable to earth/stone attacks; can be contained by blocking all windows)", "Teldris (Level 1 caster, helpless, panicked but unharmed)"],
          hasPcMap: true,
          locationType: "ruins",
        },
        {
          id: "tower-roof",
          name: "Tower Roof — Fire Elemental",
          description:
            "The roof is on fire. The fire elemental dances among the flames, not intentionally hostile but burning everything it touches. The master summoning circle (and the key to ending all four elementals at once) is chalked on the roof — half-burned.",
          mapPosition: "Open roof platform at the top of the tower (~50 ft above ground)",
          dimensions: "~60 ft diameter circular open roof; no walls — exposed on all sides; master summoning circle near center",
          connections: [
            "Down: staircase access hatch to Third Floor (~12 ft vertical)",
            "Open perimeter: 50-ft drop to ground on all sides",
          ],
          npcs: ["Fire Elemental (Level 4; immune to fire; vulnerable to cold and water; destroying it extinguishes the roof fire)"],
          hazards: ["Fire damage: characters on the roof take 1d4 fire damage per turn from ambient flames unless they have fire resistance"],
          locationType: "ruins",
        },
      ],
      keyNPCs: [
        "Teldris (Caster Apprentice): Young, well-meaning, terrible judgment. Tried to summon one elemental to impress the tower's master and accidentally bound four. Will help direct the party once freed.",
        "Master Summoning Circle: Not a person, but a key mechanic — if restored (INT DC 14, takes 3 turns), can simultaneously banish all remaining elementals.",
      ],
      specialMechanics: [
        "Elemental Banishment: Each elemental has a specific weakness listed in its room. The banishment scroll (ground floor) can dismiss one elemental if read aloud (takes 1 full action, requires INT DC 10).",
        "Tower Collapse Risk: Each time a major elemental attack is made inside the tower (GM's discretion), roll d6. On a 1, part of the floor or ceiling collapses (1d6 damage to all in the room, DEX DC 12 half).",
      ],
    },
    {
      id: "serpent-shrine-saltmaw",
      title: "The Serpent Shrine of Saltmaw",
      levelMin: 3,
      levelMax: 4,
      synopsis:
        "A small island off the coast has been taken over by a cult that worships a hydra they believe to be an immortal serpent. The cult has been raiding coastal ships for sacrifices. A shipping guild wants the cult destroyed and their captured sailors freed.",
      hook: "Three merchant vessels have been taken by cultists from an island shrine. The Saltwater Guild offers 250gp per sailor rescued and 500gp for proof the cult has been destroyed. The cult's leader reportedly controls the hydra.",
      pcMapFile: "Forgotten-Isle-Hydra-Cult-PC.webp",
      mapLayout:
        "A cave complex occupying a small rocky island, approached by boat from the south (north = up). BOAT LANDING (south): A narrow cave mouth at the island's south shoreline where a boat can moor; a 'Boat' marker is shown on the map. NORTH APPROACH CORRIDOR: A straight east-west passage running along the island's north interior (~10 ft wide, ~80 ft long); two guard positions (star icons) are at the west end and near-center, with a third point marked at the east. SEA CAVES (northwest): A rectangular carved cave chamber (~40×30 ft) with four stone pillars; iron rings in the walls hold the chained sailors. Connected to the north corridor by a short south-north passage. SHRINE OF THE SERPENT (center): A large hexagonal ritual chamber (~50 ft across) with a central altar. Accessible from the north corridor (north side) and the Hydra's Grotto (south/east). HYDRA'S GROTTO (southeast): A large irregular sea cave (~60×80 ft) with water access on the east coast. Connected to the shrine via a passage to the west/north. North is up.",
      locations: [
        {
          id: "island-beach",
          name: "The Island Shore",
          description:
            "A rocky beach with a hidden cove. Cult sentinels watch the water from clifftop posts. The only safe approach is through the sea caves on the island's north side.",
          mapPosition: "Southern tip of the island; the boat landing cave mouth",
          dimensions: "Cave entry ~10 ft wide; the sea approach is open water; cliffs rise ~20 ft on either side of the cove",
          connections: [
            "South: open sea (boat approach from the mainland)",
            "North: narrow cave passage leading into the island interior (~30 ft to where it opens toward the shrine area)",
            "East and west cliff faces: sentinel watch-posts above (~20 ft up, not directly accessible from the cave mouth)",
          ],
          npcs: ["4 Cult Sentinels (Level 1 fighters; will raise alarm if they spot the party)"],
          hasPcMap: true,
          locationType: "river-and-coast",
        },
        {
          id: "sea-caves",
          name: "The Sea Caves",
          description:
            "Narrow caves carved smooth by the sea. The cultists store their stolen goods here — and their 12 captive sailors, chained to iron rings set in the walls.",
          mapPosition: "Northwest section of the island cave complex",
          dimensions: "~40×30 ft rectangular cave chamber; four stone pillars; iron rings along the north and east walls",
          connections: [
            "South: short passage (~20 ft) connecting to the north approach corridor",
            "East: north approach corridor (~50 ft east leads to the shrine area)",
          ],
          npcs: ["12 Captive Sailors (unarmed but able to fight if freed and given weapons)"],
          hazards: ["Tidal surge: every 6 exploration turns, seawater rushes through the caves (DEX DC 12 or take 1d4 bludgeoning damage and be knocked prone)"],
          locationType: "cave",
        },
        {
          id: "shrine-complex",
          name: "The Shrine of the Serpent",
          description:
            "A crude stone shrine built around the hydra's lair entrance. Cult leaders perform rituals here, and the cult's high priestess directs the hydra through an elaborate control mechanism — a magical harp that plays the hydra into submission.",
          mapPosition: "Central chamber of the island complex",
          dimensions: "~50 ft across hexagonal stone chamber; central stone altar; the hydra passage mouth is in the south wall",
          connections: [
            "North: passage to the north approach corridor (~30 ft; leads west to Sea Caves)",
            "South/East: passage to the Hydra's Grotto (~30 ft)",
            "East: secondary sea-access passage (the hydra uses this to come and go from the ocean)",
          ],
          npcs: ["High Priestess Velmara (Level 4 cult leader; fanatical; will sacrifice herself to protect the hydra; possesses the Control Harp)"],
          locationType: "ruins",
        },
        {
          id: "hydra-lair",
          name: "The Hydra's Grotto",
          description:
            "A sea cave large enough to hold the five-headed hydra. Without the harp, the hydra attacks everything indiscriminately. With the harp, whoever plays it (CHA DC 14 per turn) can direct it.",
          mapPosition: "Southeast section of the island; a large sea cave partially open to the water",
          dimensions: "~60×80 ft irregular sea cave; partially flooded at the south end; the hydra occupies most of the space",
          connections: [
            "West/North: passage to the Shrine of the Serpent (~30 ft)",
            "East: cave mouth opens to the sea (the hydra's water access; not viable for human entry)",
          ],
          npcs: ["Ancient Hydra (Level 6, five heads; each head has 10 HP and acts independently; regenerates 1 head per round unless the stump is burned)"],
          hazards: ["Hydra regen: severed heads grow back unless cauterized with fire the same round they are severed"],
          locationType: "cave",
        },
      ],
      keyNPCs: [
        "High Priestess Velmara: True believer; cannot be reasoned out of her faith; will use the hydra as a weapon if cornered; the Control Harp is her most prized possession.",
        "Harlek (Captured Sailor Captain): Tough, pragmatic; will take command of the other sailors once freed; can sail the cult's captured vessels out.",
      ],
      specialMechanics: [
        "Hydra Regeneration: Each time a hydra head is severed, it regrows the following round unless the stump is burned (requires an action with torch or fire spell) in the same round.",
        "Control Harp: A character who takes the harp and plays it can attempt CHA DC 14 each turn to direct the hydra's attacks. On failure, the hydra acts freely. The harp is destroyed if it takes 10 damage.",
      ],
    },
    {
      id: "frost-barrow",
      title: "The Frost Barrow",
      levelMin: 2,
      levelMax: 3,
      synopsis:
        "High in the northern peaks, an ancient warlord's barrow has been discovered by miners — and something inside has frozen the mountain pass, trapping a village in perpetual winter. The village needs the source of the unnatural cold found and destroyed.",
      hook: "It is midsummer, but the mountain pass has been buried in snow for three months. The village of Harrwick is running out of food. The miners who opened the old barrow never came back — and the cold started the same week.",
      pcMapFile: "Frozen-Tomb-VTT-PC-16x18.webp",
      mapLayout:
        "A roughly hexagonal cavern-and-chamber complex cut into mountain rock (16×18 grid squares = ~160×180 ft total; north = up). The VTT map uses colored marker tokens to indicate key features. ENTRANCE (north face): A carved arch descends from the mountain surface into the barrow. The entry passage (~20 ft wide) runs south into the Burial Hall. BURIAL HALL (center-upper): A wide east-west corridor (~120 ft long × 20 ft wide) flanked by wall niches housing sarcophagi; the floor is entirely iced over. Ice 'sculptures' (frozen creatures) line the path. A single doorway at the east end leads into the Frost Heart Chamber. SOLARIUM ALCOVE (side chamber, accessible via a north-facing door midway along the Burial Hall, west side): A smaller room (~20×30 ft) with a shaft angled through the ceiling toward the surface; currently ice-plugged. FROST HEART CHAMBER (east end): The innermost chamber (~40×40 ft) where the warlord's cracked sarcophagus stands; the blue Frost Heart floats above it; the frost lich tends it here. LOWER PASSAGES: Natural cave tunnels beneath the main structure connect to the exterior (emergency exit, heavily iced). North is up.",
      locations: [
        {
          id: "barrow-entrance",
          name: "The Barrow Entrance",
          description:
            "A carved arch in the mountain face, now furred with ice and frost. The temperature drops sharply within 30 feet. Frozen miners are visible just inside — preserved perfectly in ice, expressions of terror locked in place.",
          mapPosition: "Northern face of the mountain; the carved arch entry passage",
          dimensions: "Entry arch ~20 ft wide; passage runs ~30 ft south before opening into the Burial Hall",
          connections: [
            "North: mountain exterior and the path back to Harrwick village",
            "South: entry passage leads into the Warlord's Burial Hall (~30 ft)",
          ],
          hazards: ["Extreme cold: without cold-weather gear, characters take 1d4 cold damage per hour of exposure"],
          hasPcMap: true,
          locationType: "arctic",
        },
        {
          id: "burial-hall",
          name: "The Warlord's Burial Hall",
          description:
            "A long hall with sarcophagi lining the walls, all sealed. Ice sculptures — animals, warriors, screaming faces — are arranged as if decorating the space. They are not sculptures; they are creatures flash-frozen mid-motion.",
          mapPosition: "Central-upper section of the barrow, running east-west",
          dimensions: "~120 ft long × 20 ft wide; sarcophagus niches every 10 ft along north and south walls; floor completely iced over",
          connections: [
            "West: entry passage to the Barrow Entrance (~30 ft)",
            "North wall (midpoint): door to the Solarium Alcove (~10 ft passage)",
            "East: single doorway into the Frost Heart Chamber",
          ],
          npcs: ["Three Ice Wraiths (Level 2 undead; immune to cold; vulnerable to fire; can move through ice and frozen surfaces freely)"],
          hazards: ["Frozen floor: movement costs double; DEX DC 10 to avoid falling prone when running or fighting"],
          locationType: "tomb",
        },
        {
          id: "frost-heart",
          name: "The Frost Heart Chamber",
          description:
            "The innermost chamber, where the warlord's sarcophagus has cracked open. Inside floats the Frost Heart — a blue-white crystal that pulses like a heartbeat. The warlord himself, now a frost lich, tends to it.",
          mapPosition: "East end of the barrow, the innermost chamber",
          dimensions: "~40×40 ft chamber; cracked sarcophagus at center; Frost Heart floats ~4 ft above it",
          connections: [
            "West: single doorway back into the Burial Hall",
            "The only exit is back through the Burial Hall — no other passages from this chamber",
          ],
          npcs: ["The Frost Lich (Level 5 undead; immune to cold, poison, and non-magical weapons; can only be permanently destroyed by taking the Frost Heart outside into direct sunlight, which shatters it)"],
          locationType: "tomb",
        },
        {
          id: "frost-heart-weakness",
          name: "The Solarium Alcove",
          description:
            "A side chamber with a cleverly designed shaft in the ceiling — built so that sunlight reaches the innermost chamber during summer solstice. The shaft is currently blocked by ice. Clearing it (10 damage to the ice plug) would allow sunlight to reach the Frost Heart.",
          mapPosition: "Side chamber off the north wall of the Burial Hall, roughly at the midpoint",
          dimensions: "~20×30 ft room; the ceiling shaft angles ~45 degrees toward the mountain's south face",
          connections: [
            "South: door back into the Burial Hall (~10 ft passage)",
            "Ceiling: angled shaft (currently ice-plugged) that — when cleared — directs sunlight east into the Frost Heart Chamber",
          ],
          locationType: "tomb",
        },
      ],
      keyNPCs: [
        "The Frost Lich (Warlord Kaeg): Was a great conqueror; died in battle, refused to pass on; has been slowly draining warmth from the world to sustain the Frost Heart; not entirely sane; might be spoken to briefly before fighting.",
        "Elder Marta of Harrwick: Sends the party; knows an old legend about the warlord and a 'summer key' (the solarium shaft); will reward with the village's winter stores.",
      ],
      specialMechanics: [
        "Frost Heart Destruction: The Frost Heart cannot be destroyed by damage. It must be exposed to direct sunlight (either by clearing the solarium shaft or physically carrying it outside — the Frost Lich will pursue if it leaves the barrow).",
        "Lich Phylactery: Destroying the Frost Heart destroys the Frost Lich permanently. Reducing the lich to 0 HP without destroying the Heart only incapacitates it for 1d4 hours.",
      ],
    },
    {
      id: "foxglove-cache",
      title: "The Foxglove Cache",
      levelMin: 1,
      levelMax: 2,
      synopsis:
        "The Foxglove — the town's thieves' network — has been using an old sewer system as a warehouse and accidentally unleashed something in the tunnels that is now killing their members. The Foxglove, desperate, has hired outside help to clear the threat without involving the Town Watch.",
      hook: "A hooded figure slides a purse across the table: 100gp if you clear out 'a small pest problem' in the Undermere tunnels. The Foxglove can't use their own people — half are missing and the rest refuse to go back.",
      pcMapFile: "Ill-Gotten-Gains-PC.webp",
      mapLayout:
        "Four zones connected by an underground cavern system. NORTHERN STRUCTURE (top of map): A fortified stone storehouse complex (~60×80 ft total) entered from the west via a hidden surface door. Has a main hall with two western side-rooms, an eastern barrel-storage room, and a narrow antechamber at the far north end. A south-facing archway leads down into the Central Cavern. CENTRAL CAVERN (middle): A large irregular natural cave (~120×100 ft) with an underground lake filling the center. A wooden dock platform sits mid-lake. A small domed shrine stands on the west bank. Sewer tunnels (10 ft wide) run south through the cavern, connecting the Northern Structure to the Southern Structure; webs coat these passages. SOUTHERN STRUCTURE (bottom of map): A larger rectangular complex (~80×100 ft) accessible from the north via the sewer tunnels. The cave fishers have colonized the open central area and flanking chambers here. A western alcove room and eastern rooms with a rocky interior pool feature. A south passage exits to street level. EASTERN ISLAND (right side of map): A separate two-room structure on an island in the underground lake (~30×60 ft), accessible only by boat or raft from the Central Cavern dock (~60 ft of open water). Contains the Foxglove's hidden treasure cache behind a false wall in the inner chamber.",
      locations: [
        {
          id: "foxglove-storehouse",
          name: "Foxglove Storehouse Entry",
          description:
            "A hidden door behind a barrel in a cooperage leads to an organized storage space in the sewers — stolen goods stacked neatly, a ledger, a lockbox (trapped: needle, CON DC 12 or sleep for 1 hour). Three dead Foxglove members lie near the tunnel entrance, wounds from claws.",
          mapPosition: "Northern structure, upper section of dungeon",
          dimensions: "Main hall ~40×40 ft; two western side-rooms ~20×20 ft each; eastern barrel room ~20×30 ft; narrow northern antechamber ~10×20 ft",
          connections: [
            "West: hidden door (behind barrels) to surface cooperage — dungeon entrance",
            "North (internal): 10-ft corridor to small northern antechamber (~20 ft)",
            "East (internal): doorway to barrel storage room",
            "West (internal): doors to two side-storage rooms",
            "South: stone archway exits into the Central Cavern (~20 ft to cave mouth)",
          ],
          hasPcMap: true,
          locationType: "cave",
        },
        {
          id: "nest-tunnels",
          name: "The Nest Tunnels",
          description:
            "The sewer tunnels beyond the storehouse, where something has been nesting. Webs of a strange translucent material coat the walls. Half-eaten Foxglove members are cocooned in the webs.",
          mapPosition: "Central Cavern, sewer passages running north-south through the cave",
          dimensions: "10-ft-wide tunnels; ~150 ft total length north to south through the cavern",
          connections: [
            "North: to Foxglove Storehouse Entry (~20 ft)",
            "South: to The Cave Fisher Nest (~130 ft through webbed passages)",
            "West (side passage): to domed shrine on cave's west bank (~30 ft, dead end)",
            "East (open cave): central underground lake with wooden dock visible ~40 ft east",
          ],
          hazards: ["Web trap: DEX DC 12 or be restrained (STR DC 13 to break free, or 5 fire damage to the web)"],
          locationType: "cave",
        },
        {
          id: "cave-fisher-nest",
          name: "The Cave Fisher Nest",
          description:
            "A wider tunnel chamber where three cave fishers have established a colony, lured into the tunnels by the warmth of the lamp oil stores. They have been preying on anything that enters — including Foxglove members.",
          mapPosition: "Southern structure, lower section of dungeon",
          dimensions: "Central open area ~60×60 ft; western alcove ~20×20 ft; eastern rooms with rocky interior pool ~40×40 ft; south exit corridor ~10×30 ft",
          connections: [
            "North: sewer tunnel back through Central Cavern to Nest Tunnels (~130 ft)",
            "West: doorway to western alcove room (~20 ft)",
            "East: doorway to eastern rooms and interior rocky pool area (~30 ft)",
            "South: passage to street level surface exit (~30 ft)",
          ],
          npcs: ["Three Cave Fishers (Level 2 aberrations; attack with sticky filament strands from 60 feet; reel prey in 10 feet per round)"],
          locationType: "cave",
        },
        {
          id: "foxglove-treasure-cache",
          name: "Foxglove Treasure Cache",
          description:
            "The Foxglove's real prize — a hidden room behind a false wall containing months of accumulated stolen goods: 400gp in assorted valuables, three magic items (all stolen, all potentially recognizable to their original owners).",
          mapPosition: "Eastern island, separated from main dungeon by ~60 ft of underground lake",
          dimensions: "Entry dock room ~10×20 ft; main vault chamber ~30×40 ft",
          connections: [
            "West: island dock — ~60 ft of open water to the Central Cavern's wooden dock platform (boat or raft required)",
            "Inner door: false wall concealing the vault (INT DC 13 to notice, or found by searching)",
          ],
          locationType: "cave",
        },
      ],
      keyNPCs: [
        "Sillan (Foxglove Contact): Nervous, evasive about what specifically is down there; will pay the promised reward but pocket the lockbox contents if possible; loyal to the Foxglove first.",
        "Surviving Foxglove Member: One person is still alive in the cocoons — wounded but saveable. Will be grateful and share the location of the treasure cache as thanks.",
      ],
      specialMechanics: [
        "Cave Fisher Filament: Range 60 feet. If the filament hits, target is restrained (STR DC 14 to break free or deal 10 damage to filament — AC 12). Cave fisher reels in restrained prey 10 feet per turn. A reeled-in target is devoured on the turn it reaches the fisher.",
        "Stolen Goods Complication: The three magic items in the cache are known stolen property. Using them in public risks recognition. The original owners may offer a reward — or send bounty hunters.",
      ],
    },
    {
      id: "hollowdeep-mines",
      title: "The Hollowdeep Mines",
      levelMin: 2,
      levelMax: 3,
      synopsis:
        "The miners of Hollowdeep struck something ancient three weeks ago — and the mine went silent. The mining company is offering hazard pay for anyone willing to go in, rescue survivors, and identify what was found.",
      hook: "Hollowdeep Mine has gone dark. Forty miners are unaccounted for. The Ironfeld Mining Company will pay 50gp per survivor rescued, and 200gp for a full report on what happened in the deep shaft.",
      pcMapFile: "Mines-of-Gloomwind-PC.webp",
      mapLayout:
        "An organic multi-chamber mine complex shown as irregular natural cave shapes connected by tunnels (north = up; approximate scale, not a precise grid). ELEVATOR SHAFT (upper-left, surface level): The head-frame and elevator cage at the surface; the cage hangs midway down the shaft. At the bottom of the shaft, a narrow entry passage leads east into the mine. UPPER SHAFTS (center-left cluster): Four or five interconnected cave chambers with timber-framed tunnel ceilings; partially collapsed in several sections. The barricaded survivor supply room is in a side chamber roughly east of the shaft bottom (~60 ft into the upper shaft network). Central traversal passage runs east from the upper shafts. DEEP SHAFT BRANCH (center, branching south): A newer, narrower tunnel cut south from the central passage — smooth drill-cut walls, faint violet glow. THE FIND (south end of the deep shaft branch): The deepest chamber (~40×30 ft) where the Underways vault door was breached; the Void Creature occupies this space. North is up.",
      locations: [
        {
          id: "mine-entrance",
          name: "Mine Entrance",
          description:
            "The mine's head-frame towers over the entrance. Equipment is abandoned mid-task — a loaded ore cart, a dropped lunch pail, a smashed lantern. The elevator cage is stuck midway down the shaft.",
          mapPosition: "Surface level, upper-left of the map; the head-frame and elevator shaft",
          dimensions: "Elevator shaft ~10 ft square; cage hangs midway (~30 ft below surface, ~30 ft above the shaft bottom)",
          connections: [
            "Surface: open ground around the head-frame",
            "Down: elevator shaft to the mine floor (~60 ft total depth; cage hangs midway — must climb the cable or the shaft walls)",
            "East (from shaft bottom): narrow passage leading into the Upper Mine Shafts (~20 ft)",
          ],
          hazards: ["Elevator risk: the cage is hanging by fraying cable; descending requires DEX DC 12 to avoid a 1d6 fall from a cable snap"],
          hasPcMap: true,
          locationType: "cave",
        },
        {
          id: "upper-shafts",
          name: "Upper Mine Shafts",
          description:
            "Branching tunnels supported by timber frames, many partially collapsed. Twelve survivors are hiding in a barricaded supply room — they've been there for two days and are terrified to move.",
          mapPosition: "Center-left cluster of the mine, east of the elevator shaft bottom",
          dimensions: "Network of ~4-5 interconnected cave chambers (~20-40 ft each); timber-framed tunnels ~8 ft wide connecting them; partially collapsed sections",
          connections: [
            "West: passage back to the elevator shaft (~20 ft)",
            "East: central traversal passage leading deeper into the mine (~40 ft to the Deep Shaft branch)",
            "North dead-end: a collapsed shaft (impassable)",
            "Barricaded supply room: an eastmost side chamber (~20×20 ft) — the survivors are here behind a barricade",
          ],
          npcs: ["12 Surviving Miners (exhausted, one with a broken arm; they know what they found — they beg the party not to go deeper)"],
          locationType: "cave",
        },
        {
          id: "deep-shaft",
          name: "The Deep Shaft",
          description:
            "The new tunnel cut by the night shift when they struck the find. The walls here pulse with a faint violet luminescence. Strange markings are carved into the rock — builder glyphs, alien geometry that hurts to look at too long.",
          mapPosition: "South-branching tunnel from the central traversal passage, deeper than the upper shafts",
          dimensions: "~10 ft wide × ~80 ft long tunnel heading south; walls smooth from drill machinery; ceiling height ~8 ft",
          connections: [
            "North: connects back to the central traversal passage and the Upper Mine Shafts (~40 ft)",
            "South: opens into The Find chamber (~80 ft from the branch point)",
          ],
          hazards: ["Builder glyphs: characters studying the markings for more than 1 minute must make INT DC 12 or take 1d4 psychic damage and be frightened until they look away"],
          locationType: "cave",
        },
        {
          id: "the-find",
          name: "The Find",
          description:
            "What the miners discovered: an Underways vault door, cracked open by the drilling. Inside is a sphere of pure darkness — a bound void creature the size of a carriage. It has been slowly absorbing the miners who wandered too close. The remaining missing miners are... gone.",
          mapPosition: "Southernmost point of the mine, at the end of the Deep Shaft tunnel",
          dimensions: "~40×30 ft chamber; ancient Underways vault door set into the south wall (cracked open); the Void Creature fills the center",
          connections: [
            "North: the Deep Shaft tunnel back to the Upper Shafts (~80 ft)",
            "South wall: the Underways vault door (cracked — can be pushed shut with STR DC 15 while the creature is distracted)",
          ],
          npcs: ["Bound Void Creature (Level 5 aberration; immune to non-magical weapons; takes double damage from light spells; can be rebound if the vault door is resealed — requires STR DC 15 push on the door while the creature is distracted)"],
          locationType: "cave",
        },
      ],
      keyNPCs: [
        "Foreman Dace: Survivor leader; practical and competent under pressure; knows the mine layout; will help guide the party if they promise to get his people out first.",
        "The Void Creature: It does not communicate in any way mortals can comprehend. It is simply hungry. Sealing it back in the Underways vault is the only non-lethal resolution.",
      ],
      specialMechanics: [
        "Rebinding the Creature: The vault door can be pushed closed while the creature is distracted (occupied consuming something or someone). Two characters must succeed at STR DC 15 simultaneously. The door then seals automatically if shut.",
        "Light Weakness: Spells or effects that produce magical light deal double damage to the Void Creature. Torches and mundane light deal no damage but cause it to recoil (it will avoid lit areas if possible).",
      ],
    },
    {
      id: "beast-beneath-tower",
      title: "The Beast Beneath the Tower",
      levelMin: 1,
      levelMax: 2,
      synopsis:
        "A village has been terrorized by something living in the basement of an old caster's tower. Three people have gone missing. But the creature isn't what anyone expects — and the real danger is the tower itself.",
      hook: "Three villagers have vanished near old Meldrath's Tower. The village headman begs for help. 'The tower has been empty for twenty years,' he says, 'but something has moved in.'",
      pcMapFile: "Monster-under-Tower-PC.webp",
      mapLayout:
        "A cross-section illustration of Meldrath's Tower showing all vertical levels (not a top-down grid; the map is a side-view cutaway). The tower is circular, ~20 ft diameter, set on a low hill. EXTERIOR: The hill with a dead herb garden; the front door is at ground level on the south face. FLOOR 1 (GROUND): Entry room with the central spiral staircase (hugs the outer wall) going up, and a cellar hatch in the floor (southeast corner) going down. Magical hazards throughout the room. FLOOR 2: The laboratory; active experiments (cauldron of acid slime, throwing bookshelf). Staircase continues up. FLOOR 3 (TOP HABITABLE): More experiments; the false wall to Meldrath's Hidden Study is on the north-facing interior wall (INT DC 13 to detect). The staircase continues to a roof access hatch. BASEMENT (below grade): Accessed via hatch and wooden stairs from the ground floor. A ~30 ft diameter cave chamber with mud-and-water floor; the shade cat den. Each floor is ~12 ft tall; total tower height ~50 ft. North is the hill's upslope direction.",
      locations: [
        {
          id: "tower-exterior",
          name: "The Tower Exterior",
          description:
            "Meldrath's tower stands on a low hill, its stones black with age. The door is unlocked. A garden of dead herbs surrounds it. Tracks — large, six-toed — lead from the tower door to the village well and back.",
          mapPosition: "Hilltop grounds surrounding the tower base",
          dimensions: "Tower is ~20 ft diameter; the low hill is ~60 ft across; dead herb garden surrounds the base",
          connections: [
            "South: the village path (~200 yards downhill to the village)",
            "Tower door (south face, ground level): leads into Tower Floor 1",
          ],
          hasPcMap: true,
          locationType: "ruins",
        },
        {
          id: "tower-floors",
          name: "Tower Floors (1-3)",
          description:
            "The three floors above ground are a disaster — Meldrath's experiments, abandoned and decaying. Several are still active: a self-stirring cauldron of acidic slime (touching it: 1d4 acid), a bookshelf that hurls books at anyone who approaches (1d4 bludgeoning, Meldrath's defenses), and a cage containing a malnourished shade cat kitten.",
          mapPosition: "Above-ground floors of the tower; Floor 1 at ground level, Floors 2-3 above",
          dimensions: "Each floor ~20 ft diameter circular room; ceiling height ~12 ft; staircase hugs the outer wall; Floor 3 is ~24 ft above ground",
          connections: [
            "Floor 1, south: front door to the Tower Exterior",
            "Floor 1, southeast: cellar hatch and wooden stairs down to the Tower Basement (~10 ft below)",
            "Staircase: connects all three floors (~12 ft per floor); each floor is a separate room on the staircase loop",
            "Floor 3, north wall: false wall hiding Meldrath's Hidden Study (INT DC 13 to find)",
            "Floor 3, ceiling: roof access hatch (~50 ft above ground; roof is exposed)",
          ],
          npcs: ["Shade Cat Kitten (non-hostile if offered food; its mother is in the basement — she stole the villagers to feed her young)"],
          locationType: "ruins",
        },
        {
          id: "tower-basement",
          name: "The Tower Basement",
          description:
            "The 'monster': a shade cat mother and two other kittens. She moved in after Meldrath died, using the basement as a den. The three missing villagers are here — alive, unharmed, kept like prey in reserve. She attacks if cornered.",
          mapPosition: "Below the ground floor, reached via cellar hatch and wooden stairs",
          dimensions: "~30 ft diameter cave chamber; ceiling ~10 ft; mud-and-water floor; single wooden stair/hatch access",
          connections: [
            "Up: wooden stairs and cellar hatch to Tower Floor 1 ground level (~10 ft vertical; the only exit)",
          ],
          npcs: ["Shade Cat (Level 4; her flickering between visibility makes attacks against her miss 50% on first attempt; she is protecting her young and will retreat if her kittens are in danger)"],
          locationType: "ruins",
        },
        {
          id: "meldrath-study",
          name: "Meldrath's Hidden Study",
          description:
            "Behind a false wall on the third floor (INT DC 13 or perception check to find): Meldrath's real notes, a potion of healing, and a wand of force (5 charges). The notes reveal why he left: he discovered the tower was built over a ley line that makes magical experiments unpredictable (doubles the effect of all magic cast here — for better or worse).",
          mapPosition: "Behind a false wall on the north side of Tower Floor 3 (the uppermost habitable floor)",
          dimensions: "~10×10 ft alcove behind the false wall; shelving and a small writing desk",
          connections: [
            "East: the false wall opens into Tower Floor 3 (INT DC 13 to detect the seam)",
          ],
          locationType: "ruins",
        },
      ],
      keyNPCs: [
        "Shade Cat Mother: Predatory but not malicious — she is caring for her young. If the kittens are safely relocated, she will follow them away from the tower without further violence. Shade cats are large felines that flicker between visibility — folk say they walk half in this world and half in another.",
        "The Three Villagers: A farmer, a herbalist, and a child. They are scared but healthy. The mother hasn't hurt them — she's been leaving them uneaten, possibly as she decides.",
      ],
      specialMechanics: [
        "Shade Flicker: The shade cat's flickering means all attack rolls against it have a 50% miss chance on the first attempt each round (roll d6; 1-3 = miss regardless of other results). This chance resets at the start of each of the cat's turns.",
        "Ley Line Magic: Any spell cast inside the tower is rolled twice and the GM chooses which result applies — making powerful spells extremely potent but also extremely unpredictable.",
      ],
    },
    {
      id: "cyst-beneath-thornmeet",
      title: "The Cyst Beneath Thornmeet",
      levelMin: 3,
      levelMax: 4,
      synopsis:
        "A demonic cyst has ruptured beneath a crossroads shrine, spilling minor demons into the surrounding area. The Waywardens — a folk guardian order — dispatched a team to seal it, but their team hasn't reported back. Their leader needs a reliable group to complete the sealing.",
      hook: "Strange shadows and whispered fears have gripped the crossroads village of Thornmeet. The old ancestor shrine is cracked and bleeding black ichor. Warden Calandria sent her best people two days ago — silence since.",
      pcMapFile: "Terror-Demon-Cyst-PC.webp",
      mapLayout:
        "TWO ZONES: an above-ground shrine building and a below-ground cyst chamber (north = up). THORNMEET SHRINE (above): A stone shrine building with a large circular nave (~50 ft diameter); a bell tower rises from the north side. The main entrance is from the south. Side alcoves flank the nave east (~20×20 ft) and west (~20×20 ft). The crack in the nave floor weeps black ichor — this is the access point to the Cyst Chamber below. Shadow demons lurk in the bell tower (north). FALLEN TEAM LOCATION: The wardens fell in the nave near the floor crack; Aldus is still alive here. CYST CHAMBER (below, accessible via the cracked floor opening): Two sub-chambers beneath the shrine. A debris-and-rubble cave to the southwest (~30 ft across, partially collapsed) — where the fallen wardens' gear is scattered. A circular stone chamber to the southeast (~40 ft diameter) where the 15-ft Demon Cyst floats at center. The Cyst Warden orbits the cyst. The Manifestation Chamber is this same space if the worst occurs. North is up.",
      locations: [
        {
          id: "thornmeet-village",
          name: "Thornmeet Village",
          description:
            "A small crossroads village in the grip of supernatural dread. Doors are barred, children kept inside. The ancestor shrine at the center of town weeps black ichor from a crack in its foundation. Two shadow demons have taken up residence in the shrine's bell tower.",
          mapPosition: "Above ground; the shrine building at the center of Thornmeet crossroads",
          dimensions: "Shrine nave ~50 ft diameter circular hall; bell tower ~15×15 ft, ~30 ft tall (north); side alcoves ~20×20 ft east and west",
          connections: [
            "South: main shrine entrance doors to the village square and crossroads",
            "North: bell tower interior (shadow demons here; ladder access, ~30 ft up)",
            "East alcove: side chapel (~20×20 ft)",
            "West alcove: side chapel (~20×20 ft)",
            "Nave floor (center): cracked opening weeping black ichor — descends to the Cyst Chamber below (~15 ft drop)",
          ],
          npcs: ["Two Shadow Demons (Level 3; immune to non-magical weapons; vulnerable to warding or light-based damage; can hide in any shadow)"],
          hasPcMap: true,
        },
        {
          id: "warden-team-remains",
          name: "The Fallen Team",
          description:
            "Calandria's team of three wardens are here — two dead, one barely alive. The survivor, Aldus, has been driven partially mad by the cyst's fear aura. He knows the sealing procedure but must make WIS DC 12 each round to act coherently.",
          mapPosition: "In the shrine nave near the floor crack; two wardens are dead on the floor, Aldus is propped against the east wall",
          dimensions: "Located within the shrine nave; the fallen wardens are scattered within 20 ft of the floor crack",
          connections: [
            "Located in the Thornmeet Shrine nave — same space as the shrine encounter",
          ],
          npcs: ["Warden Aldus (wounded, partially mad, but functional with support; knows the ritual)"],
          locationType: "ruins",
        },
        {
          id: "demon-cyst",
          name: "The Demon Cyst",
          description:
            "Beneath the shrine: a 15-foot sphere of calcified demonic matter, cracked open. Minor demons emerge from it every 10 minutes (1d4 dretches per emergence). Sealing it requires pouring consecrated oil on each of three cracks while chanting — 3 full rounds of ritual action, total.",
          mapPosition: "Below the shrine nave, in the circular southeast sub-chamber",
          dimensions: "Cyst chamber ~40 ft diameter; the Demon Cyst is 15 ft across and floats at center; the Cyst Guardian orbits within 30 ft",
          connections: [
            "Up: the cracked floor opening rises ~15 ft to the shrine nave above (climbable, or drop down)",
            "West: rubble passage to the debris cave sub-chamber (~20 ft; partially collapsed, navigable)",
          ],
          npcs: ["Cyst Guardian (Level 4 demon; guards the cyst; cannot leave within 30 feet of the cyst; attempts to interrupt the sealing ritual)"],
          hazards: ["Fear Aura: all creatures within 30 feet of the cyst must make WIS DC 13 at the start of each turn or be frightened (must move away from cyst) for 1 round"],
          locationType: "ruins",
        },
        {
          id: "manifestation-chamber",
          name: "The Manifestation Chamber",
          description:
            "If the sealing ritual is interrupted at the final stage, the cyst spasms and releases a fully-formed Abyssal Manifestation — a demon of concentrated fear. This is the worst-case scenario.",
          mapPosition: "Same chamber as the Demon Cyst — the Manifestation erupts from the cyst if the ritual is fully interrupted",
          dimensions: "Same ~40 ft diameter chamber; the Manifestation fills the room with its presence",
          connections: [
            "Same as the Demon Cyst chamber; the only exits are up through the floor crack or west into the debris cave",
          ],
          npcs: ["Abyssal Manifestation (Level 5 demon; only appears if ritual is fully interrupted; immune to fear; destroying it automatically seals the cyst)"],
          locationType: "ruins",
        },
      ],
      keyNPCs: [
        "Warden Calandria: Awaits outside Thornmeet; grieving her fallen wardens; will enter the village to help if the party seems overwhelmed (Level 4 caster with warding magic, has one use of mass healing and blinding light).",
        "Warden Aldus: Knows the ritual procedure; his madness clears if he can make 3 consecutive WIS DC 12 saves (aided by help action or a calming spell).",
      ],
      specialMechanics: [
        "Sealing Ritual: Three cracks, one action each (pour oil + chant). The ritual resets if all three actions are interrupted before completion. Each crack sealed dims the fear aura by 5 (DC drops from 13 to 8 with all three sealed). The Cyst Guardian actively attempts to interrupt each action.",
        "Dretch Spawning: Every 10 exploration turns (or whenever GM deems dramatically appropriate), 1d4 dretches emerge from the cyst. They are weak (Level 1) but persistent.",
      ],
    },
    {
      id: "the-scorchard",
      title: "The Scorchard",
      levelMin: 1,
      levelMax: 2,
      synopsis:
        "A once-fertile apple orchard is dying — fruit rotting on the vine, trees burning from the inside with no visible flame. The village relies on the orchard for trade. The source is a fire sprite colony that has taken up residence in the ancient heartwood tree at the orchard's center.",
      hook: "The Brambleton orchard — source of half the region's apple trade — is dying in a manner that defies explanation. Fruit smolders. The oldest tree is warm to the touch and glows at night. The orchardist will give anything to save it.",
      pcMapFile: "The-Scorchard-PC.webp",
      locations: [
        {
          id: "orchard-edge",
          name: "The Orchard Margins",
          description:
            "The outer rows of apple trees are merely sick — yellowed leaves, fruit that smells of smoke. Evidence of heat damage radiates from the center. The orchardist's dog won't enter the orchard.",
          hasPcMap: true,
          locationType: "forest",
        },
        {
          id: "sprite-territory",
          name: "The Inner Grove",
          description:
            "The fire sprites are active here — tiny flame-winged creatures about the size of a robin. They flit between the trees, setting small fires accidentally. They are not malicious — they are simply living their normal lives and the orchard is drying out around them.",
          npcs: ["Fire Sprite Colony (20+ sprites; each is Level 0, harmless individually; but frightened fire sprites scatter and set random fires — a frightened colony starts a major fire within 1d4 rounds)"],
          hazards: ["Random fire ignition: any aggressive action toward sprites causes 1d4 nearby trees to ignite, spreading 1 per round until doused"],
          locationType: "forest",
        },
        {
          id: "heartwood-tree",
          name: "The Heartwood Tree",
          description:
            "An ancient apple tree, three times the height of any other, its trunk hollow and warm. The sprite queen has her nest inside — a beautiful creature the size of a cat, made entirely of living flame. She chose this tree because it was dying before she arrived; the sprites are not the cause, they are a symptom of something older.",
          npcs: ["Fire Sprite Queen (Level 2; intelligent, can communicate; chose the tree because it was already dying from a blight; will leave peacefully if given an alternative home)"],
          locationType: "forest",
        },
        {
          id: "blight-source",
          name: "The Blight Root",
          description:
            "Investigation (INT DC 13 Nature check or the sprite queen's information) reveals the real cause: a deep root blight killing the heartwood tree from below. The sprites are drawn to dying wood. Curing the blight (a herbalist's task, 3-day project) or destroying the heartwood tree will cause the sprites to move on naturally.",
          locationType: "forest",
        },
      ],
      keyNPCs: [
        "The Fire Sprite Queen: Intelligent, proud, speaks in poetic riddles (she thinks mortals understand fire metaphor); is genuinely willing to relocate if given a worthy home (a dying tree in a remote forest, for instance). She is NOT the cause of the blight.",
        "Orchardist Maren: Desperate, initially hostile to negotiation (wants the sprites 'killed'); will listen if presented with evidence that the sprites are a symptom, not the cause.",
      ],
      specialMechanics: [
        "Sprite Panic: If any fire sprite is attacked or killed, all sprites in the area immediately panic. Each panicking sprite sets fire to a random nearby object. A panicking colony (10+ sprites) will cause a major fire within 1d4 rounds unless calmed (CHA DC 14, requires speaking to the queen).",
        "Non-Combat Resolution: The adventure is fully solvable without combat. Negotiating with the queen (CHA DC 12) to relocate her colony to a different dying tree is the optimal outcome — it saves the orchard AND preserves the sprites.",
      ],
    },
    {
      id: "the-tarwell",
      title: "The Tarwell",
      levelMin: 2,
      levelMax: 3,
      synopsis:
        "An ancient tar pit at the edge of the moors has been active for centuries — but something ancient has awoken in its depths, and now tar-men walk the moors at night, dragging travelers into the pit.",
      hook: "Three travelers have disappeared on the north road. The innkeeper at Fenwick Post swears she saw a man-shaped thing made of black tar drag the last one off the road. The road is the only route to the northern market — and the merchant guilds are furious.",
      pcMapFile: "The-Tarwell-PC.webp",
      mapLayout:
        "The map shows a large interior space that is the Tarwell Inn — a waystation on the North Road — plus the tar pit moor location nearby (north = up). TARWELL INN (map building): A rectangular hall (~200×140 ft, 20×14 squares) with: a west end featuring a curved apse room (the inn's tap room/hearth alcove); a large central hall with three rows of long benches/tables; small side rooms along the north and south walls (sleeping quarters, storage); a barrel room in the northeast corner. This is where the party meets the innkeeper and hears about the disappearances. THE TAR PIT (outdoor, adjacent to the north road ~10 min from the inn): An ancient 200-ft-wide depression in the moorland filled with black tar. The rim is a 10-ft-wide ring around the edge. Two tar golems patrol the rim. SUBMERGED RUINS: 6 ft below the tar surface, roughly at the pit's center. MATRIARCH'S CHAMBER: At the lowest point of the pit (~15 ft below surface, center-south). North is up.",
      locations: [
        {
          id: "north-road",
          name: "The North Road",
          description:
            "The road north runs near the tar pit for half a mile. Tar smears on the road mark where victims were taken. Tracks (deep impressions, oozing black) lead off the road toward the pit.",
          mapPosition: "Outdoor; the north road passes within 50 ft of the tar pit's western rim",
          dimensions: "Road is ~20 ft wide; the tar smear zone runs along ~half a mile of roadway",
          connections: [
            "South: road leads back to the Tarwell Inn (~10 min walk, ~half mile)",
            "North: road continues to the northern market (the intended destination of the missing travelers)",
            "East: tracks lead off-road ~50 ft to the Tar Pit Edge",
          ],
          hasPcMap: true,
          locationType: "grassland",
        },
        {
          id: "tar-pit-edge",
          name: "The Tar Pit Edge",
          description:
            "The rim of the ancient tar pit: a 200-foot-wide depression filled with black, slowly bubbling tar. The smell is overwhelming. Two tar-men guard the rim, slowly patrolling.",
          mapPosition: "The moorland depression east of the north road; the pit rim is the accessible perimeter",
          dimensions: "Pit is ~200 ft diameter; the navigable rim is ~10 ft wide around the full perimeter; the tar surface is ~3 ft below the rim lip",
          connections: [
            "West: 50 ft of moorland back to the North Road",
            "Down (into tar): the tar surface; any immersion leads toward the Submerged Ruins (6 ft below) and the Matriarch's Chamber (15 ft below at center-south)",
          ],
          npcs: ["Two Tar Golems (Level 3 constructs; immune to fire, which heats the tar but doesn't ignite it; slow-moving but impossible to permanently damage unless the Tarwell Matriarch is destroyed; restoring them if destroyed takes 1d4 rounds)"],
          hazards: ["Tar edge: stepping within 5 feet of the pit's edge requires DEX DC 12 or slide into the tar (swimming requires STR DC 14 each round or sink 5 feet per round)"],
          locationType: "swamp",
        },
        {
          id: "submerged-ruins",
          name: "Submerged Ruins",
          description:
            "Six feet below the tar surface: old stone ruins. The three missing travelers are here — alive, preserved by the tar's strange properties, unconscious. Reaching them requires submerging in the tar.",
          mapPosition: "Beneath the tar surface, roughly at the pit's center, ~6 ft below the tar surface",
          dimensions: "Stone ruin walls running east-west beneath the pit; open chambers ~20-30 ft across; travelers are chained to iron rings in the east ruin wall",
          connections: [
            "Up: 6 ft of tar to the pit surface (swim STR DC 14 per round)",
            "Down: the ruins descend further south ~9 ft more to the Matriarch's Chamber",
          ],
          hazards: ["Tar immersion: characters fully submerged in tar take 1d4 suffocation damage per round; they can see nothing and can only navigate by touch"],
          locationType: "swamp",
        },
        {
          id: "matriarch-chamber",
          name: "The Matriarch's Chamber",
          description:
            "At the pit's lowest point: a stone chamber, ancient, carved with spiral symbols. The Tarwell Matriarch — an ancient black pudding the size of a draft horse that has gained crude intelligence — sits at the center. She is the source of the tar-men. She considers the pit her domain and mortals passing above as intruders.",
          mapPosition: "Deepest point of the tar pit, ~15 ft below the surface, center-south of the pit",
          dimensions: "~30×30 ft stone chamber carved with spiral symbols; ceiling is tar-saturated stone; the Matriarch fills most of the floor space",
          connections: [
            "Up: ~9 ft of tar and rubble back to the Submerged Ruins level, then ~6 ft more to the surface",
            "The chamber has no other exits — the Matriarch has sealed the passages with her own mass",
          ],
          npcs: ["Tarwell Matriarch (Level 5 ooze; immune to slashing and fire; vulnerable to cold; divides when struck by lightning; destroying her deactivates all tar golems instantly)"],
          locationType: "swamp",
        },
      ],
      keyNPCs: [
        "The Tarwell Matriarch: Ancient, alien intelligence; communicates only in slow pulses of tar. She doesn't hate travelers — she simply considers them resources. Has been dormant for centuries; something woke her (a recent earthquake, or a stupid treasure hunter).",
        "The Three Survivors: Preserved by tar, technically fine — they wake immediately when extracted. Will have nightmares about tar for years.",
      ],
      specialMechanics: [
        "Tar Swimming: Requires STR DC 14 per round to make progress. Failure means sinking 5 feet. Full submersion deals 1d4 suffocation per round. Cold water (from a flask or spell) briefly solidifies nearby tar, creating a firm surface.",
        "Tar Golem Regeneration: Unless the Matriarch is destroyed, destroyed Tar Golems reform from the pit after 1d4 rounds. The only way to permanently eliminate them is to destroy the Matriarch first.",
      ],
    },
    {
      id: "thrice-sealed-vault",
      title: "The Thrice-Sealed Vault",
      levelMin: 3,
      levelMax: 4,
      synopsis:
        "A legendary vault sealed by three casters three hundred years ago has had its first seal mysteriously broken. The Arcane Council fears what might escape if the remaining seals fail. They're offering a substantial sum for the party to enter, identify the threat, and reinforce the seals.",
      hook: "The first seal on the Vault of Three Casters has cracked. The Arcane Council is offering 400gp to a party willing to enter the vault, assess the threat, and prevent the remaining seals from breaking — by any means necessary.",
      pcMapFile: "Thrice-Sealed-PC.webp",
      mapLayout:
        "A four-wing sealed vault complex (north = up). The map shows four parallel wings running north-south, each ~200 ft long × 40 ft wide, separated by impenetrable vault walls of solid stone. The wings are connected at their south ends by a single east-west corridor (~160 ft long × 20 ft wide). The north ends of each wing terminate in the individual seal chambers. Dense stone fill (shown as cross-hatching) occupies the spaces between wings and is impassable. WING 1 (westmost): The exterior approach and entry; the vault door with three seals faces north. WING 2: The First Seal (Gold) wing; a complex of inner passages leading to the summoning chamber at the north end. WING 3: The Second Seal (Silver) wing; similar inner passage structure leading to the stasis chamber. WING 4 (eastmost): The Third Seal (Iron) wing; the most protected; inner passages lead to the innermost chamber at the north end. Movement between wings requires traveling south to the connecting corridor. North is up.",
      locations: [
        {
          id: "vault-exterior",
          name: "Vault Exterior",
          description:
            "A featureless stone cube, 40 feet on each side, with three enormous iron seals set into the door — each a different color (gold, silver, iron). The gold seal is cracked and leaking a faint yellow mist.",
          mapPosition: "Outside the vault structure; the north-facing exterior door of Wing 1 (westmost wing)",
          dimensions: "The vault exterior is a featureless stone cube ~40×40 ft; the door is ~15 ft wide with three mounted seals",
          connections: [
            "North: open ground outside the vault",
            "South (through door): enters the Wing 1 passage leading to the First Seal Chamber",
            "The three seals are mounted left to right: Gold (broken), Silver (cracking), Iron (intact) — each corresponds to its own wing interior",
          ],
          hasPcMap: true,
          locationType: "ruins",
        },
        {
          id: "first-seal-chamber",
          name: "First Seal Chamber (Gold — Broken)",
          description:
            "The chamber behind the first seal: a summoning chamber where a bound creature has been slowly expanding against its binding circle for three centuries. The circle has finally cracked. The creature — a genie-like entity made of golden light — is half-free and half-still-bound.",
          mapPosition: "North end of Wing 2 (second from west); accessible via the inner passages of Wing 1 and the south connector corridor",
          dimensions: "Summoning chamber ~40×40 ft; cracked binding circle occupies the floor center; the Efreeti is half-inside, half-outside the circle",
          connections: [
            "South: inner passage back through Wing 2 to the south connector corridor (~180 ft total)",
            "East (via south corridor): passage to Second Seal Chamber wing (~40 ft east along connector, then north)",
          ],
          npcs: ["Bound Efreeti (Level 4 fire genie; half-maddened by three centuries of imprisonment; alternates between rage and lucidity; can be re-bound with a new circle — INT DC 15 ritual, 10 minutes, requires chalk and silence)"],
          locationType: "tomb",
        },
        {
          id: "second-seal-chamber",
          name: "Second Seal Chamber (Silver — Cracking)",
          description:
            "The silver seal is cracking from the pressure of the first seal's failure. Inside: the original caster who designed the vault, preserved in magical stasis, slowly waking. She is three hundred years out of time and does not fully understand that her colleagues are long dead.",
          mapPosition: "North end of Wing 3 (center wing); accessible via the south connector corridor from Wing 2",
          dimensions: "Stasis chamber ~40×40 ft; the stasis field occupies the center (~15 ft diameter glowing sphere); Elowen is inside it, slowly waking",
          connections: [
            "South: inner passage back to the south connector corridor (~180 ft)",
            "West (via south corridor): back to First Seal Chamber wing (~40 ft)",
            "East (via south corridor): to Third Seal Chamber wing (~40 ft east along connector, then north)",
          ],
          npcs: ["Caster Elowen (Level 5, friendly but disoriented; has the repair sequence for all three seals in her memory — she sealed herself in with the vault's contents as a last resort; will help if she trusts the party)"],
          locationType: "tomb",
        },
        {
          id: "third-seal-chamber",
          name: "Third Seal Chamber (Iron — Intact)",
          description:
            "The innermost chamber: an entity so dangerous that the casters never even named it in their notes. It sleeps behind the iron seal. Waking it would be catastrophic. The seal is intact — and must stay that way.",
          mapPosition: "North end of Wing 4 (eastmost wing); the deepest and most protected chamber",
          dimensions: "Innermost chamber ~40×40 ft; the Iron Seal is a massive disc set in the north wall; the room behind it is unknown — do not open it",
          connections: [
            "South: inner passage back to the south connector corridor (~180 ft; this is the only safe route in or out)",
            "West (via south corridor): back toward the other seal chambers",
          ],
          hazards: ["Dream leak: even through the intact seal, the entity's dreams radiate. Any character who sleeps within the vault has nightmares and must make WIS DC 14 or gain 1 level of exhaustion."],
          locationType: "tomb",
        },
      ],
      keyNPCs: [
        "Caster Elowen: The vault's designer, three centuries out of time; grieving (she doesn't yet know her colleagues are dead); will share all she knows if treated with compassion; holds the master seal repair sequence.",
        "The Bound Efreeti: Three centuries of captivity have made it unhinged; it will attack first, but has moments of terrifying clarity in which it begs to be freed; freeing it (dangerous) or re-binding it are both valid paths.",
      ],
      specialMechanics: [
        "Seal Repair Ritual: Each seal can be repaired with a 10-minute ritual (chalk circle, verbal incantation, INT DC 15 check). Failure sets the ritual back but doesn't damage the seal further. Elowen can grant advantage on the check if she assists.",
        "Efreeti Lucidity: At the start of each round, roll d6. On a 5-6, the Efreeti becomes lucid (will stop attacking, may ask to be released or offer a deal). On a 1-4, rage continues.",
      ],
    },
    {
      id: "vault-once-great-thief",
      title: "The Vault of the Once-Great Thief",
      levelMin: 2,
      levelMax: 3,
      synopsis:
        "The legendary thief Aldara Pell hid her greatest haul in a private vault when she retired — then died without telling anyone where it was. Now her estate is being sold, and the estate's new owner has discovered the vault entrance. She's hiring a delve team — at 20% of whatever they find.",
      hook: "The estate of retired thief Aldara Pell has sold, and the new owner found a hidden door in the cellar. She's offering 20% of whatever's inside to a trustworthy delve team. Aldara was known for her love of traps.",
      pcMapFile: "Vault-Once-Great-Thief-PC.webp",
      mapLayout:
        "A single-level underground vault beneath an estate cellar (north = up). CELLAR ENTRANCE (west): A stone arch entry passage (~20 ft) from the wine cellar above, triggered by a specific bottle on the wine rack. Leads east into the trap corridor. THE HALL OF ALDARA'S PRIDE (center, running east-west): A long trap corridor (~120 ft long × 20 ft wide) with six distinct trap sections; each section has different floor markings or architecture. The traps run west-to-east: pressure plates, tripwires, false floor, spinning blade wall, gas nozzle, mirror illusion. A door midway along the north wall leads into the Puzzle Room. THE PUZZLE ROOM (north, mid-corridor): A square room (~30×40 ft) with walls entirely covered in tiny drawers. A door in the east wall leads to the Final Vault (requires the key from the puzzle). THE FINAL VAULT (east end): A sealed room (~40×30 ft) behind a locked door. A rocky built-in strongbox is set into the northeast corner wall. North is up.",
      locations: [
        {
          id: "vault-entrance",
          name: "The Cellar Entrance",
          description:
            "A stone door behind a wine rack, triggered by pulling a specific bottle (WIS DC 12 to notice the worn label, or INT DC 14 to puzzle it out). The vault beyond is Aldara's masterwork — a series of rooms each guarded by a trap that she personally designed.",
          mapPosition: "Western end; the secret door from the estate wine cellar above",
          dimensions: "Entry passage ~20 ft long × 10 ft wide; stone door is flush with the wall",
          connections: [
            "West: stone door (secret) back up to the estate wine cellar",
            "East: passage opens into the west end of The Hall of Aldara's Pride (~20 ft)",
          ],
          hasPcMap: true,
          locationType: "ruins",
        },
        {
          id: "trap-corridor",
          name: "The Hall of Aldara's Pride",
          description:
            "A long corridor with six distinct traps: pressure plates (DEX DC 12 to detect and disable), tripwires (INT DC 13), a false floor (WIS DC 14 to spot the discoloration), a spinning blade wall section (DEX DC 14 to dodge, 2d6 damage), a gas nozzle (CON DC 12 or sleep 1 hour), and a mirror that casts a fear illusion (WIS DC 13 or frightened 1 round).",
          mapPosition: "Central east-west corridor; the main body of the vault",
          dimensions: "~120 ft long × 20 ft wide; six distinct trap sections each ~20 ft long; floor texture changes between sections",
          connections: [
            "West: Cellar Entrance (~20 ft back to the entry passage)",
            "North wall (midpoint, after trap section 3): door into Aldara's Puzzle Room",
            "East: corridor continues past trap sections 4-6 to a locked door into the Final Vault",
          ],
          hazards: ["Multiple traps: listed above"],
          locationType: "tomb",
        },
        {
          id: "puzzle-room",
          name: "Aldara's Puzzle Room",
          description:
            "A room with the walls covered in tiny drawers — hundreds of them. Only one holds a key. The correct drawer can be identified by a cipher scratched on the ceiling (INT DC 14 to decode). The wrong drawers contain: nothing, a smoke bomb, a dye explosion (marks skin bright purple for a week), or a needle trap.",
          mapPosition: "North of the trap corridor, accessible via a door at the corridor's midpoint",
          dimensions: "~30×40 ft room; all four walls floor-to-ceiling tiny drawers (hundreds); cipher scratched into ceiling plaster",
          connections: [
            "South: door back into The Hall of Aldara's Pride (midpoint of corridor)",
            "East wall: a locked door leading to the Final Vault (opened with the key found in the correct drawer)",
          ],
          hazards: ["Wrong drawer: 50% nothing, 25% smoke bomb, 15% dye, 10% needle (CON DC 12 or sleep 1 hour)"],
          locationType: "tomb",
        },
        {
          id: "aldara-vault",
          name: "The Final Vault",
          description:
            "The payoff: Aldara's greatest haul. 2,000gp in gold coins (heavy — requires multiple trips or a strong party), three genuine magic items, a ledger of all her scores (potentially valuable to blackmailers or law enforcement), and a personal letter to 'whoever is clever enough to get here,' congratulating them.",
          mapPosition: "Eastern end of the vault complex; accessible from the trap corridor (east) or the puzzle room (east door)",
          dimensions: "~40×30 ft sealed room; gold coin stacks along the south wall; a built-in strongbox is set into the northeast corner",
          connections: [
            "West: locked door back into the trap corridor east end (can be opened from inside without a key)",
            "North: locked door from the Puzzle Room (also opened from inside without a key)",
          ],
          locationType: "tomb",
        },
      ],
      keyNPCs: [
        "Aldara Pell (deceased): Communicated through the vault design itself — she clearly enjoyed building this. The congratulatory letter reveals a sharp wit and genuine respect for anyone who makes it through.",
        "The New Estate Owner: Hires the party; trustworthy about the 20% cut; will have the gold counted and weighed. Becomes a useful patron if treated fairly.",
      ],
      specialMechanics: [
        "Trap Detection: All traps in the corridor can be detected with the appropriate skill check before triggering. Rushing through without checking triggers each trap automatically. The party can safely disable a trap with 1 minute of work after detecting it.",
        "Ledger Value: The blackmail ledger contains names of 12 current town officials who hired Aldara. Selling it to a criminal organization yields 500gp; turning it over to law enforcement yields 300gp and a favor; keeping it provides potential leverage.",
      ],
    },
    {
      id: "warrens-deepwood-king",
      title: "The Warrens of the Deepwood King",
      levelMin: 2,
      levelMax: 3,
      synopsis:
        "The goblin tribe known as the Rot-Tooth has been launching increasingly organized raids under the leadership of a goblin king called the Deepwood King. A town has hired adventurers to end the raids — but the Deepwood King may be a symptom of a larger problem.",
      hook: "The village of Millhaven has been raided four times in six weeks. The raids are well-organized — someone is directing the Rot-Tooth goblins. The town council offers 200gp to stop the raids permanently.",
      pcMapFile: "Warrens-Deepwood-King-PC.webp",
      mapLayout:
        "A cross-section illustration showing both the surface forest and the underground warren (not a top-down grid; the map is a cutaway side-view). SURFACE: A large ancient deepwood tree with spreading branches; goblin scout pairs patrol the forest between the trees in a ~200 ft radius. The tree's roots reach deep into the earth. WARREN ENTRANCE: A hole in the ground at the tree's root base (~5 ft wide), partially disguised with brush. An earth ramp descends ~10 ft into the main tunnel. ENTRY TUNNELS (immediately inside): Earth-and-timber tunnels (~5-6 ft tall, 4-5 ft wide) reinforced with wooden beams; crude barricades and crossbow-slot walls near the entrance. WEST CAVE (left of map): A large natural cave chamber (~40×40 ft) with mushroom growth and goblin bedding/common area. THRONE ROOM (right/east of map): A separate cave chamber (~30×30 ft) decorated with stolen furniture and trophies; the Deepwood King's throne is at the far east wall; goblin champions flank. HIDDEN MEETING ROOM: A small concealed side tunnel (~15×15 ft) branching south from the Throne Room's south wall (INT/WIS DC 14 to find the door). North is the surface/upward direction.",
      locations: [
        {
          id: "forest-approach",
          name: "The Deepwood Approach",
          description:
            "The forest outside Millhaven, patrolled by goblin scouts. Three patrol pairs can be spotted and avoided (WIS DC 12 per pair) or ambushed (STR or DEX to strike first). One patrol carries a message written in broken Common — evidence that the Deepwood King is receiving instructions from a third party.",
          mapPosition: "Surface forest; a ~200 ft radius around the large deepwood tree that hides the warren entrance",
          dimensions: "Open forest; patrol pairs move in roughly triangular routes between the trees; the tree is at the center",
          connections: [
            "South: the road to Millhaven village (~30 min walk)",
            "Center: the large ancient tree; the warren entrance is at its root base",
          ],
          npcs: ["Three goblin scout pairs (Level 1 each, cowardly if outnumbered 2-to-1)"],
          hasPcMap: true,
          locationType: "forest",
        },
        {
          id: "warren-entrance",
          name: "The Warren Entrance",
          description:
            "An old badger sett expanded into a proper warren entrance, disguised with brush and dead wood. Inside: the warrens are well-maintained, with crude but effective fortifications. The Deepwood King's warband has proper equipment — too good for goblins.",
          mapPosition: "At the root base of the large deepwood tree; descends underground",
          dimensions: "Entry hole ~5 ft wide; earth ramp descends ~10 ft; entry tunnel ~5 ft tall × 4 ft wide for the first 20 ft",
          connections: [
            "Up: earth ramp to the surface forest (forest approach)",
            "West (~30 ft): tunnel opens into the West Cave common area",
            "East (~30 ft): tunnel branches east toward the Throne Room",
          ],
          npcs: ["Warren Guard (4 goblins with crossbows, Level 1)"],
          locationType: "cave",
        },
        {
          id: "throne-room",
          name: "The Deepwood King's Throne Room",
          description:
            "A surprisingly well-decorated chamber for a goblin warren. The Deepwood King sits on a throne made of stolen furniture — a goblin who has clearly been given money, weapons, and direction from outside. Two goblin champions flank him. His ledger contains the name of his patron.",
          mapPosition: "East cave chamber, right side of the warren",
          dimensions: "~30×30 ft cave chamber; throne against the east wall; stolen tapestries and trophies on the walls",
          connections: [
            "West: tunnel back to the Warren Entrance (~30 ft)",
            "North: passage to the West Cave common area (~20 ft)",
            "South wall: concealed door to the Secret Meeting Room (INT/WIS DC 14 to find)",
          ],
          npcs: ["The Deepwood King (Level 3 goblin warchief; intelligent, paranoid, and outmaneuvered if his patron is revealed to him)", "Two Goblin Champions (Level 2)"],
          locationType: "cave",
        },
        {
          id: "hidden-meeting-room",
          name: "The Secret Meeting Room",
          description:
            "A side chamber not marked on any goblin's map — used by the Deepwood King's patron for their meetings. Contains correspondence revealing the patron: a Millhaven merchant who hired the goblins to raid his competitors and blame the raids on the forest folk.",
          mapPosition: "South of the Throne Room, accessed via a concealed door in the south wall",
          dimensions: "~15×15 ft earthen chamber; a small table and two stools; correspondence stacked in a waterproof box",
          connections: [
            "North: concealed door back into the Throne Room (INT/WIS DC 14 to find from the Throne Room side)",
          ],
          hazards: ["Concealed: INT DC 14 or WIS DC 14 to find the door"],
          locationType: "cave",
        },
      ],
      keyNPCs: [
        "The Deepwood King: A cunning goblin who jumped at the chance to become important; will surrender or flee if his patron is exposed and his warband is defeated; has no loyalty to the patron.",
        "Merchant Carvan Doss (the Patron): A legitimate Millhaven merchant using the raids to eliminate his trade competitors; will attempt to bribe the party if confronted; his scheme falls apart if the ledger reaches the town council.",
      ],
      specialMechanics: [
        "The Third Party Twist: If the party shares the patrol message with the Deepwood King (showing him his patron doesn't respect him), he becomes a temporary ally — allowing them to confront the patron together. This is the non-violent resolution path.",
        "Warren Collapse: The warrens are not structurally sound in several areas. Major combat (loud, with explosions) has a 1-in-6 chance per round of causing a partial collapse in the current room (1d6 damage, DEX DC 12 half).",
      ],
    },
    {
      id: "word-eating-wyrm",
      title: "The Word-Eating Wyrm",
      levelMin: 3,
      levelMax: 5,
      synopsis:
        "A strange creature called the Word-Eating Wyrm has taken up residence beneath a great library. Every book the wyrm consumes grants it new knowledge — and it is growing rapidly in power. The library's head archivist needs it removed before it consumes the entire collection.",
      hook: "Books are disappearing from the Grand Archivum overnight, with no signs of entry or theft. But the night guard reports hearing something large moving beneath the floor. Head Archivist Petra will pay generously to identify and remove the threat without destroying the library.",
      pcMapFile: "Word-Eating-Wyrm-PC.webp",
      mapLayout:
        "A multi-level library building (north = up; map shows the main floor plan, ~250×150 ft). MAIN FLOOR (ground level, shown on map): A large rectangular library with four primary shelving wings running north-south (visible as long rows of wooden shelves). A central reading room occupies the middle (~60×40 ft open space with reading tables). Entry doors on the west face. Side offices and storage rooms along the south wall. Staircase towers in the northeast and northwest corners connect to upper floors. RESTRICTED SECTION (northeast corner of main floor, behind a locked iron gate): A walled-off section (~50×50 ft) with the most dangerous texts; the floor has the largest wyrm-holes here. A hidden floor panel in the restricted section (INT DC 12 to find) descends to the sub-basement. UPPER FLOORS 2-5: Accessible via the corner staircases; progressively smaller shelving sections and reading galleries; similar layout to the ground floor. WYRM TUNNELS: Circular holes (~3 ft diameter) appear in floors throughout the building — the wyrm travels between floors through these. SUB-BASEMENT (below the main floor): A single circular chamber (~40 ft diameter) eaten from the foundation stone; surrounded by digested book-dust. The wyrm's nest is here.",
      locations: [
        {
          id: "library-main",
          name: "The Grand Archivum",
          description:
            "Five floors of shelved books, scrolls, and manuscripts. Evidence of the wyrm's activity: missing sections, fine powdery residue (digested vellum), and strange circular holes in the floor of the restricted section. The wyrm travels through the building's stone by consuming the material around it.",
          mapPosition: "The main library building; primarily the ground floor and accessible upper floors",
          dimensions: "Main floor ~250×150 ft; five floors total (~12 ft per floor, ~60 ft total height); staircase towers in NE and NW corners",
          connections: [
            "West: main entrance doors to the street",
            "Northeast corner: staircase to upper floors 2-5",
            "Northwest corner: secondary staircase to upper floors 2-5",
            "Northeast corner (main floor): locked iron gate into the Restricted Section",
            "Wyrm holes: 3-ft circular openings in the floor connect to lower levels (drop 10-12 ft, 1d6 damage)",
          ],
          hasPcMap: true,
          locationType: "university-district",
        },
        {
          id: "restricted-section",
          name: "The Restricted Collection",
          description:
            "The section housing the Archivum's most dangerous texts — magical compendiums and forbidden lore. The wyrm has eaten several, giving it access to multiple magical effects. The floor here has the largest holes.",
          mapPosition: "Northeast corner of the main floor, behind a locked iron gate",
          dimensions: "~50×50 ft walled section; iron gate on the west wall; shelving for dangerous texts on all walls; multiple 3-ft wyrm-holes in the floor",
          connections: [
            "West: locked iron gate back to the main library floor (Head Archivist has the key)",
            "Floor (multiple wyrm-holes): the largest hole is ~3 ft — drops ~12 ft to the sub-basement; hidden floor panel nearby also descends (INT DC 12 to find)",
          ],
          hazards: ["Unstable floor: several sections of floor are weakened by the wyrm's tunnels; moving quickly requires DEX DC 12 or fall through (10-foot drop, 1d6 damage)"],
          locationType: "university-district",
        },
        {
          id: "sub-basement",
          name: "The Sub-Basement",
          description:
            "Beneath the library: the original building's cellar, repurposed as overflow storage for unsorted acquisitions. The wyrm's nest is here — a circular chamber it has eaten out of the foundation stone, surrounded by piles of digested book-dust.",
          mapPosition: "Below the main floor, beneath the restricted section; the wyrm's nest",
          dimensions: "~40 ft diameter circular chamber eaten from foundation stone; ceiling ~8 ft; floor covered in fine book-dust and vellum powder",
          connections: [
            "Up: wyrm-holes rising to the restricted section (~12 ft; must climb or be hoisted)",
            "Up: the hidden floor panel ascends to the restricted section (ladder-accessible)",
            "The wyrm travels freely through the walls and floors — it may enter or exit from any direction",
          ],
          npcs: ["The Word-Eating Wyrm (Level 5 aberration; has consumed 47 books, granting it INT 18 and the ability to cast any spell from those books once per day; vulnerable to silence — it cannot eat in silence)"],
          locationType: "cave",
        },
        {
          id: "knowledge-core",
          name: "The Knowledge Core",
          description:
            "At the wyrm's center: a glowing mass of condensed knowledge — the distilled essence of every book it has consumed. Extracting this core (without killing the wyrm) is possible (DEX DC 15 while the wyrm is incapacitated) and yields an object worth 500gp to the right buyer.",
          mapPosition: "Inside the wyrm's body, at its physical center; the wyrm is in the Sub-Basement",
          dimensions: "A glowing mass ~1 ft across; visible through the wyrm's semi-translucent body when it is still or incapacitated",
          connections: [
            "Accessible only by incapacitating the wyrm (e.g., via magical silence) then reaching into or cutting open its body (DEX DC 15)",
          ],
          locationType: "cave",
        },
      ],
      keyNPCs: [
        "Head Archivist Petra: Determined to preserve the collection; prefers the wyrm removed alive if possible (she's curious about it); will pay 300gp for removal without library damage, 200gp for any removal, 50gp for 'you burned half the place' damage.",
        "The Word-Eating Wyrm: Not evil — just hungry. Its intelligence has been growing as it consumes more books. A character who can communicate with it discovers it is becoming self-aware and afraid of its own hunger.",
      ],
      specialMechanics: [
        "Silence Weakness: The wyrm cannot eat in a zone of magical silence. A silence spell or the Silence scroll (found in the restricted section, INT DC 12 to identify) instantly stops the wyrm from moving and feeding. It will attempt to leave the silenced area.",
        "Spell Absorption: The wyrm has consumed 47 books. Once per encounter, it can cast any spell from those books (GM's choice, tier 1-3). Track its remaining spell uses — it started with 5 random spells and loses one each time it casts.",
      ],
    },
  ],
};
