import type { AdventureCollection } from "./types";

export const SHOTS_IN_THE_DARK_1: AdventureCollection = {
  id: "shots-in-the-dark-1",
  title: "Shots in the Dark #1",
  adventures: [
    {
      id: "spores-undercity",
      title: "Spores from the Undercity",
      levelMin: 1,
      levelMax: 1,
      synopsis:
        "Strange fungal spores seep from the city's storm drains, driving those exposed to madness. The city council offers a reward for anyone brave enough to descend into the undercity and destroy the source.",
      hook: "Unsettling spores have begun seeping from the city's storm drains, causing hallucinations and violent madness in those exposed. The city is offering 50gp for any bold soul willing to investigate.",
      pcMapFile: "Spores-Undercity-PC.png",
      locations: [
        {
          id: "drain-entry",
          name: "The Drain Entry",
          description:
            "A stench-filled storm drain grate at the edge of the merchant quarter. The iron grate can be forced open (STR DC 12) or unlocked with a key taken from the sewer watchman's body.",
          hazards: ["Spore cloud: characters without a wet cloth over their face must make CON DC 10 or suffer -1 to INT for 1 hour"],
          hasPcMap: true,
        },
        {
          id: "spore-garden",
          name: "The Spore Garden",
          description:
            "A vast underground chamber carpeted in luminous fungal blooms. The spores fill the air in thick clouds. The source of the city's contamination lies here — a cracked mycelial node the size of a wagon wheel.",
          hazards: ["Fungal seed infection: any character entering without protection must make CON DC 12 or begin 7-day gestation toward fungal transformation"],
          hasPcMap: true,
        },
        {
          id: "freyas-camp",
          name: "Freya's Camp",
          description:
            "A dry alcove off the main fungal chamber, cluttered with alchemical equipment and hanging dried herbs. Freya Blackwood, a sewer witch, has been living here studying the spores — she didn't intend to contaminate the city above.",
          npcs: ["Freya Blackwood, Sewer Witch (neutral, territorial but not malicious)"],
        },
        {
          id: "mycelial-core",
          name: "The Mycelial Core",
          description:
            "The cracked node at the chamber's heart, pulsing with sickly bioluminescent light. Destroying it (dealing 20 damage or pouring alchemical fire on it) stops the spore contamination — but triggers a violent spore eruption as it dies.",
          hazards: ["Dying core eruption: all creatures within Near range make CON DC 14 or take 2d6 poison damage"],
        },
      ],
      keyNPCs: [
        "Freya Blackwood (Sewer Witch): Neutral but territorial; has been studying the spores for weeks; can direct the party to the core. Can be persuaded with gold or flattery. Knows a poultice recipe that grants advantage on CON saves vs. spore infection.",
      ],
      specialMechanics: [
        "Fungal Infection: Any character exposed in the Spore Garden (without protection) must make CON DC 12 each day or progress one step toward fungal transformation. After 7 days at the final stage, transformation is complete. Cure: destroy the Mycelial Core, or Freya's antidote poultice.",
      ],
    },
    {
      id: "flooded-crypt",
      title: "The Flooded Crypt",
      levelMin: 1,
      levelMax: 2,
      synopsis:
        "A nobleman's crypt has flooded with brackish water from an underground spring, disturbing the restless dead within. Tomb robbers sent to retrieve a family heirloom never returned — now the family is offering a reward.",
      hook: "The Voss family crypt has flooded after a spring burst through its foundation. Their hired delvers vanished inside. The family matriarch will pay 75gp for the safe return of the Voss signet ring — and begs that their ancestors be laid to rest.",
      pcMapFile: "Flooded-Crypt-VTT-PC-22x14.png",
      locations: [
        {
          id: "crypt-entrance",
          name: "Crypt Entrance",
          description:
            "Stone steps descend into knee-deep black water. The smell of rot and standing water fills the air. Waterlogged torches in iron sconces flicker weakly.",
          hasPcMap: true,
        },
        {
          id: "antechamber",
          name: "The Antechamber",
          description:
            "A wide room with carved stone reliefs depicting the Voss family's military history. The water here reaches waist-deep on a human. Four raised sarcophagi stand above the waterline.",
          npcs: ["Three animated skeletons of Voss soldiers — hostile"],
          hazards: ["Waist-deep water: movement costs double, DEX-based attacks at disadvantage"],
        },
        {
          id: "flooded-vault",
          name: "The Flooded Vault",
          description:
            "The deepest chamber, entirely submerged. The Voss signet ring lies on a pedestal at the far end — next to the bloated corpse of one of the missing tomb robbers, now animated as a waterlogged wight.",
          npcs: ["Voss Wight (Level 3 undead, can only be harmed by silver, fire, or magic)"],
          hazards: ["Fully submerged: characters must hold breath (CON rounds) or begin drowning. Constitution saves every round after."],
        },
        {
          id: "spring-source",
          name: "The Spring Source",
          description:
            "A cracked wall in the back of the flooded vault where the underground spring enters. Plugging the crack (STR DC 15 or magical means) will slowly drain the crypt over 10 minutes.",
        },
      ],
      keyNPCs: [
        "Lady Mira Voss: Elderly family matriarch; hires the party; insists her ancestors be given proper rest (i.e., the wight destroyed, not just avoided).",
        "Voss Wight: The risen corpse of the head tomb robber, empowered by the disturbed family spirits; wears the robber's gear and the Voss signet ring around its neck.",
      ],
      specialMechanics: [
        "Underwater Combat: All attacks in fully submerged areas have disadvantage unless the attacker has a swimming speed. Spells with verbal components require a CON DC 12 check or fail.",
        "Drowning: Characters holding their breath may do so for CON rounds. On failure, they begin drowning and take 1d6 damage per round.",
      ],
    },
    {
      id: "rotting-gardens",
      title: "The Rotting Gardens of Rafflesia",
      levelMin: 1,
      levelMax: 2,
      synopsis:
        "A once-celebrated botanical garden has been consumed by a monstrous carnivorous plant called the Rafflesia. Villagers who tried to burn it have vanished. A herbalist desperately needs a rare blossom from the garden's heart.",
      hook: "The village herbalist, old Torben, needs a Moonbloom flower from the estate gardens to cure a plague spreading through the village — but the gardens have become a nightmare of carnivorous growth and missing people.",
      pcMapFile: "Rotting-Gardens-Rafflesia-PC.png",
      locations: [
        {
          id: "garden-gate",
          name: "The Garden Gate",
          description:
            "Rusted iron gates hang open. The path beyond is choked with twisted vines and enormous flytraps the size of dogs. The stench of rotting flesh drifts on a warm wind.",
          hazards: ["Vine tendrils: DEX DC 12 to move through without triggering a grapple (STR 14, deals 1d4 constriction per round)"],
          hasPcMap: true,
        },
        {
          id: "greenhouse",
          name: "The Old Greenhouse",
          description:
            "A shattered glass structure, now overgrown. The missing villagers are here — three of them, cocooned in plant matter but still alive. Saving them requires cutting through the vines (dealing 15 damage to the cocoon) without harming the occupant.",
          npcs: ["Three cocooned villagers (unconscious but alive)"],
        },
        {
          id: "rafflesia-heart",
          name: "The Rafflesia Heart",
          description:
            "The center of the garden, dominated by an enormous fleshy bloom ten feet across. The Rafflesia is the size of a draft horse and is semi-intelligent — it attacks anything that enters its reach. The Moonbloom grows in a sheltered hollow beneath it.",
          npcs: ["The Rafflesia (giant carnivorous plant, Level 3, reach attack, can swallow small creatures)"],
          hazards: ["Corpse-stench aura: characters within Near range must make CON DC 10 at the start of each turn or be Sickened (disadvantage on attacks) for 1 round"],
        },
        {
          id: "moonbloom-hollow",
          name: "The Moonbloom Hollow",
          description:
            "Beneath the Rafflesia, sheltered from the rot, a cluster of pale silver flowers blooms in a patch of clean soil. One bloom is enough for Torben's cure.",
        },
      ],
      keyNPCs: [
        "Torben (Herbalist): Desperate, elderly, will trade potions for help; knows the Rafflesia's weakness — it is vulnerable to fire and salt.",
        "The Rafflesia: Semi-intelligent plant entity; it has been growing since the estate owner died and left the garden to ruin; not truly evil, just hungry and territorial.",
      ],
      specialMechanics: [
        "Plant Grapple: Many plants in the garden can grapple. A grappled character is pulled 5 feet toward the plant each round (no save) until they break free (STR DC 12) or the plant is destroyed.",
        "Rafflesia Swallow: On a natural 18-20 attack, the Rafflesia swallows a Small or smaller creature. Inside: 2d6 acid damage per round, STR DC 14 to break free.",
      ],
    },
    {
      id: "blackbridge-labyrinth",
      title: "The Blackbridge Labyrinth",
      levelMin: 2,
      levelMax: 3,
      synopsis:
        "Beneath a crumbling black stone bridge lies a maze built by a mad architect centuries ago. A merchant's son vanished exploring it on a dare. The maze still shifts — walls slide and doors lock themselves.",
      hook: "Young Aldric Thorne went exploring the legendary shifting maze beneath Blackbridge and hasn't returned in three days. His father, a wealthy merchant, offers 150gp for Aldric alive — or 50gp for his signet ring.",
      pcMapFile: "Blackbridge-Labyrinth-PC.png",
      locations: [
        {
          id: "maze-entrance",
          name: "The Maze Entrance",
          description:
            "A iron door set into the base of the bridge's central pillar, unlocked and slightly ajar. The air inside smells of old stone and something metallic. Geometric patterns are carved into every surface.",
          hasPcMap: true,
        },
        {
          id: "shifting-corridors",
          name: "Shifting Corridors",
          description:
            "Narrow stone passages that rearrange themselves every hour on the hour (marked by a deep grinding sound). Characters must make INT DC 12 to maintain their sense of direction after a shift, or become lost.",
          hazards: ["Maze shift: every 10 exploration turns, roll d6. On 1-2, the maze shifts — all doors reset, exits relocate. Lost characters wander for 1d4 turns before finding a landmark."],
        },
        {
          id: "mirror-chamber",
          name: "The Chamber of Mirrors",
          description:
            "A large room walled entirely in black glass. The reflections are wrong — they move independently and whisper. One of the mirrors is a portal to the puzzle room. A maze-guardian golem patrols here.",
          npcs: ["Stone Maze-Guardian (Level 3 construct; immune to fire and poison; stops when the architect's key is presented)"],
        },
        {
          id: "aldrics-prison",
          name: "Aldric's Holding Chamber",
          description:
            "A locked room deep in the maze where Aldric has been trapped. He's hungry and frightened but unharmed. The door lock requires solving a number-pattern puzzle carved in the wall (INT DC 14, or find the solution scrawled on a note in the mirror chamber).",
          npcs: ["Aldric Thorne (young merchant's son, unharmed, frightened)"],
        },
        {
          id: "architects-vault",
          name: "The Architect's Vault",
          description:
            "The maze's central chamber with a sarcophagus of the mad architect, Corvus Mell. His key (disables the guardian) and his journal (explains the maze logic) are here, along with 300gp in old coin.",
        },
      ],
      keyNPCs: [
        "Aldric Thorne: Pampered merchant's son; terrified but alive; will follow any rescuer out without complaint.",
        "Maze-Guardian: An ancient stone construct animated by the architect; not truly hostile — it only attacks those who threaten the vault. Will stand down if the architect's key is shown.",
      ],
      specialMechanics: [
        "Maze Navigation: Track exploration turns. Every 10 turns, roll d6 — on 1-2 the maze shifts. Characters must make INT DC 12 after a shift or spend 1d4 turns lost before finding a recognizable landmark.",
        "Puzzle Lock: The holding chamber door requires either solving the carved puzzle (INT DC 14, 10-minute attempt) or finding the solution note in the mirror chamber first.",
      ],
    },
    {
      id: "doom-cear-ferros",
      title: "The Doom of Cear Ferros",
      levelMin: 3,
      levelMax: 4,
      synopsis:
        "The iron fortress of Cear Ferros fell to a demonic curse three generations ago. Now the curse has begun spreading to the surrounding farmland. A paladin order has tasked adventurers with entering the fortress, descending to its cursed well, and purifying it.",
      hook: "Crops around the old iron fortress are rotting on the vine, and livestock are born wrong. The Iron Hand paladins believe the Doom Well beneath Cear Ferros has begun to overflow its binding. They'll pay 300gp to see it sealed.",
      pcMapFile: "Doom-Cear-Ferros-PC-main.png",
      locations: [
        {
          id: "fortress-courtyard",
          name: "Fortress Courtyard",
          description:
            "The overgrown courtyard of Cear Ferros. Iron trees (their leaves hammered metal) line the path to the keep. Three demonic sentinels — former soldiers bound to the fortress forever — patrol in a fixed pattern.",
          npcs: ["Three Bound Iron Sentinels (Level 3 undead-fiend hybrids; cannot leave the fortress grounds)"],
          hasPcMap: true,
        },
        {
          id: "great-hall",
          name: "The Blighted Great Hall",
          description:
            "Once a feasting hall, now a tomb. The long table is set with the rotted remains of a last feast, the silverware corroded black. A demon lieutenant named Vassek holds court here, toying with a captive scholar.",
          npcs: ["Vassek, Demon Lieutenant (Level 4 fiend; immune to fire; can be bargained with — will release the scholar for the party's promise to leave the well alone)"],
        },
        {
          id: "doom-well",
          name: "The Doom Well",
          description:
            "A spiral stair descends to a circular chamber dominated by a massive iron well. The well's water is solid black and radiates intense cold. Sealing it requires pouring a vial of holy water into the well while reciting the Iron Hand's binding prayer — then surviving the doom spirit that erupts from it.",
          hazards: ["Doom aura: characters within Near range take 1 cold damage per round and must make WIS DC 12 or suffer -1 to their next attack roll (the Doom whispers despair)"],
          hasPcMap: true,
        },
        {
          id: "spirit-chamber",
          name: "The Spirit Chamber",
          description:
            "As the well is sealed, the Doom Spirit — a massive shadow entity bound to this place — erupts from the water for one final confrontation before being sealed away forever.",
          npcs: ["The Doom Spirit (Level 5 shadow; immune to non-magical weapons; destroyed when well is sealed, not before)"],
        },
      ],
      keyNPCs: [
        "Vassek (Demon Lieutenant): Arrogant but tactical; will deal if the party seems strong enough to threaten him; secretly fears the Doom Spirit and doesn't want it released.",
        "Scholar Pen Drell: Captive historian studying the fortress; has a copy of the binding prayer and a vial of holy water; wants to be rescued.",
        "The Doom Spirit: The ancient evil bound to the well; it cannot leave the fortress; it will beg, bargain, and threaten as it is sealed away.",
      ],
      specialMechanics: [
        "Binding Ritual: To seal the well, the party must pour holy water into it AND recite the binding prayer (takes 2 full rounds, cannot be interrupted without restarting). The Doom Spirit erupts on round 1 of the ritual and attacks until slain or the ritual completes.",
        "Sentinel Pattern: The courtyard sentinels follow a fixed patrol pattern. With a successful INT DC 10, the party can observe the pattern and move past safely.",
      ],
    },
    {
      id: "elemental-mistakes",
      title: "Elemental Mistakes",
      levelMin: 2,
      levelMax: 3,
      synopsis:
        "A young mage's summoning experiment went catastrophically wrong, binding four elementals to four floors of a tower and sealing all the exits. The mage is trapped inside. The tower's owner wants it cleared — and the mage retrieved.",
      hook: "Smoke pours from the windows of Teldris's Tower and strange lights flash within. The mage's apprentice ran out screaming about 'elementals everywhere.' The tower owner is offering 200gp to clear the mess and retrieve young Teldris alive.",
      pcMapFile: "Elemental-Mistakes-VTT-PC-12x41.png",
      locations: [
        {
          id: "tower-base",
          name: "Tower Base — Earth Elemental",
          description:
            "The ground floor, half-buried in stone and earth that have erupted through the floor. An earth elemental circles the staircase to the second floor, unable to move past it but blocking all passage.",
          npcs: ["Earth Elemental (Level 3; immune to non-magical bludgeoning; can be dismissed by reading the banishment scroll found in the mage's desk — buried under rubble, INT DC 13 to locate)"],
          hasPcMap: true,
        },
        {
          id: "tower-second",
          name: "Second Floor — Water Elemental",
          description:
            "Ankle-deep water covers the floor; the walls weep and the ceiling drips. A water elemental occupies the stairwell, flowing through cracks. The mage's potions lab is here — potions float in the water.",
          npcs: ["Water Elemental (Level 3; can move through cracks; vulnerable to lightning; can be dismissed by the banishment scroll or redirected through the window with a successful WIS DC 14)"],
        },
        {
          id: "tower-third",
          name: "Third Floor — Air Elemental",
          description:
            "Windows blown out, furniture spinning in a vortex. The wind is strong enough to push a creature off the tower (STR DC 12 or be flung through the window — 30 foot drop). Teldris is tied to a chair here, spinning.",
          npcs: ["Air Elemental (Level 3; immune to thunder; vulnerable to earth/stone attacks; can be contained by blocking all windows)", "Teldris (Level 1 Mage, helpless, panicked but unharmed)"],
          hasPcMap: true,
        },
        {
          id: "tower-roof",
          name: "Tower Roof — Fire Elemental",
          description:
            "The roof is on fire. The fire elemental dances among the flames, not intentionally hostile but burning everything it touches. The master summoning circle (and the key to ending all four elementals at once) is chalked on the roof — half-burned.",
          npcs: ["Fire Elemental (Level 4; immune to fire; vulnerable to cold and water; destroying it extinguishes the roof fire)"],
          hazards: ["Fire damage: characters on the roof take 1d4 fire damage per turn from ambient flames unless they have fire resistance"],
        },
      ],
      keyNPCs: [
        "Teldris (Mage Apprentice): Young, well-meaning, terrible judgment. He tried to summon one elemental to impress his master and accidentally bound four. Will help direct the party once freed.",
        "Master Summoning Circle: Not a person, but a key mechanic — if restored (INT DC 14, takes 3 turns), can simultaneously banish all remaining elementals.",
      ],
      specialMechanics: [
        "Elemental Banishment: Each elemental has a specific weakness listed in its room. The banishment scroll (ground floor) can dismiss one elemental if read aloud (takes 1 full action, requires INT DC 10).",
        "Tower Collapse Risk: Each time a major elemental attack is made inside the tower (GM's discretion), roll d6. On a 1, part of the floor or ceiling collapses (1d6 damage to all in the room, DEX DC 12 half).",
      ],
    },
    {
      id: "forgotten-isle-hydra-cult",
      title: "The Forgotten Isle of the Hydra Cult",
      levelMin: 3,
      levelMax: 4,
      synopsis:
        "A small island off the coast has been taken over by a cult that worships a hydra they believe to be a divine serpent. The cult has been raiding coastal ships for sacrifices. A shipping guild wants the cult destroyed and their captured sailors freed.",
      hook: "Three merchant vessels have been taken by cultists from an island shrine. The Saltwater Guild offers 250gp per sailor rescued and 500gp for proof the cult has been destroyed. The cult's leader reportedly controls the hydra.",
      pcMapFile: "Forgotten-Isle-Hydra-Cult-PC.png",
      locations: [
        {
          id: "island-beach",
          name: "The Island Shore",
          description:
            "A rocky beach with a hidden cove. Cult sentinels watch the water from clifftop posts. The only safe approach is through the sea caves on the island's north side.",
          npcs: ["4 Cult Sentinels (Level 1 fighters; will raise alarm if they spot the party)"],
          hasPcMap: true,
        },
        {
          id: "sea-caves",
          name: "The Sea Caves",
          description:
            "Narrow caves carved smooth by the sea. The cultists store their stolen goods here — and their 12 captive sailors, chained to iron rings set in the walls.",
          npcs: ["12 Captive Sailors (unarmed but able to fight if freed and given weapons)"],
          hazards: ["Tidal surge: every 6 exploration turns, seawater rushes through the caves (DEX DC 12 or take 1d4 bludgeoning damage and be knocked prone)"],
        },
        {
          id: "shrine-complex",
          name: "The Shrine of the Serpent",
          description:
            "A crude stone temple built around the hydra's lair entrance. Cult leaders perform rituals here, and the cult's high priest directs the hydra through an elaborate control mechanism — a magical harp that plays the hydra into submission.",
          npcs: ["High Priest Velmara (Level 4 Cleric of the Serpent; fanatical; will sacrifice herself to protect the hydra; possesses the Control Harp)"],
        },
        {
          id: "hydra-lair",
          name: "The Hydra's Grotto",
          description:
            "A sea cave large enough to hold the five-headed hydra. Without the harp, the hydra attacks everything indiscriminately. With the harp, whoever plays it (CHA DC 14 per turn) can direct it.",
          npcs: ["Ancient Hydra (Level 6, five heads; each head has 10 HP and acts independently; regenerates 1 head per round unless the stump is burned)"],
          hazards: ["Hydra regen: severed heads grow back unless cauterized with fire the same round they are severed"],
        },
      ],
      keyNPCs: [
        "High Priest Velmara: True believer; cannot be reasoned out of her faith; will use the hydra as a weapon if cornered; the Control Harp is her most prized possession.",
        "Harlek (Captured Sailor Captain): Tough, pragmatic; will take command of the other sailors once freed; can sail the cult's captured vessels out.",
      ],
      specialMechanics: [
        "Hydra Regeneration: Each time a hydra head is severed, it regrows the following round unless the stump is burned (requires an action with torch or fire spell) in the same round.",
        "Control Harp: A character who takes the harp and plays it can attempt CHA DC 14 each turn to direct the hydra's attacks. On failure, the hydra acts freely. The harp is destroyed if it takes 10 damage.",
      ],
    },
    {
      id: "frozen-tomb",
      title: "The Frozen Tomb",
      levelMin: 2,
      levelMax: 3,
      synopsis:
        "High in the northern peaks, an ancient warlord's tomb has been discovered by miners — and something inside has frozen the mountain pass, trapping a village in perpetual winter. The village needs the source of the unnatural cold found and destroyed.",
      hook: "It is midsummer, but the mountain pass has been buried in snow for three months. The village of Harrwick is running out of food. The miners who opened the old tomb never came back — and the cold started the same week.",
      pcMapFile: "Frozen-Tomb-VTT-PC-16x18.png",
      locations: [
        {
          id: "tomb-entrance",
          name: "The Tomb Entrance",
          description:
            "A carved arch in the mountain face, now furred with ice and frost. The temperature drops sharply within 30 feet. Frozen miners are visible just inside — preserved perfectly in ice, expressions of terror locked in place.",
          hazards: ["Extreme cold: without cold-weather gear, characters take 1d4 cold damage per hour of exposure"],
          hasPcMap: true,
        },
        {
          id: "burial-hall",
          name: "The Warlord's Burial Hall",
          description:
            "A long hall with sarcophagi lining the walls, all sealed. Ice sculptures — animals, warriors, screaming faces — are arranged as if decorating the space. They are not sculptures; they are creatures flash-frozen mid-motion.",
          npcs: ["Three Ice Wraiths (Level 2 undead; immune to cold; vulnerable to fire; can move through ice and frozen surfaces freely)"],
          hazards: ["Frozen floor: movement costs double; DEX DC 10 to avoid falling prone when running or fighting"],
        },
        {
          id: "frost-heart",
          name: "The Frost Heart Chamber",
          description:
            "The innermost chamber, where the warlord's sarcophagus has cracked open. Inside floats the Frost Heart — a blue-white crystal that pulses like a heartbeat. The warlord himself, now a frost lich, tends to it.",
          npcs: ["The Frost Lich (Level 5 undead; immune to cold, poison, and non-magical weapons; can only be permanently destroyed by taking the Frost Heart outside into direct sunlight, which shatters it)"],
        },
        {
          id: "frost-heart-weakness",
          name: "The Solarium Alcove",
          description:
            "A side chamber with a cleverly designed shaft in the ceiling — built so that sunlight reaches the innermost chamber during summer solstice. The shaft is currently blocked by ice. Clearing it (10 damage to the ice plug) would allow sunlight to reach the Frost Heart.",
        },
      ],
      keyNPCs: [
        "The Frost Lich (Warlord Kaeg): Was a great conqueror; died in battle, refused to pass on; has been slowly draining warmth from the world to sustain the Frost Heart; not entirely sane; might be spoken to briefly before fighting.",
        "Elder Marta of Harrwick: Sends the party; knows an old legend about the warlord and a 'summer key' (the solarium shaft); will reward with the village's winter stores.",
      ],
      specialMechanics: [
        "Frost Heart Destruction: The Frost Heart cannot be destroyed by damage. It must be exposed to direct sunlight (either by clearing the solarium shaft or physically carrying it outside — the Frost Lich will pursue if it leaves the tomb).",
        "Lich Phylactery: Destroying the Frost Heart destroys the Frost Lich permanently. Reducing the lich to 0 HP without destroying the Heart only incapacitates it for 1d4 hours.",
      ],
    },
    {
      id: "ill-gotten-gains",
      title: "Ill-Gotten Gains",
      levelMin: 1,
      levelMax: 2,
      synopsis:
        "A thieves' guild has been using an old city sewer network as a warehouse — and has accidentally unleashed something in the tunnels that is now killing their members. The guild, desperate, has hired outside help to clear the threat without involving the city watch.",
      hook: "A hooded figure slides a purse across the table: 100gp if you clear out 'a small pest problem' in the Undermere tunnels. The guild can't use their own people — half are missing and the rest refuse to go back.",
      pcMapFile: "Ill-Gotten-Gains-PC.png",
      locations: [
        {
          id: "guild-storehouse",
          name: "Guild Storehouse Entry",
          description:
            "A hidden door behind a barrel in a cooperage leads to an organized storage space in the sewers — stolen goods stacked neatly, a ledger, a lockbox (trapped: needle, CON DC 12 or sleep for 1 hour). Three dead guild members lie near the tunnel entrance, wounds from claws.",
          hasPcMap: true,
        },
        {
          id: "nest-tunnels",
          name: "The Nest Tunnels",
          description:
            "The sewer tunnels beyond the storehouse, where something has been nesting. Webs of a strange translucent material coat the walls. Half-eaten guild members are cocooned in the webs.",
          hazards: ["Web trap: DEX DC 12 or be restrained (STR DC 13 to break free, or 5 fire damage to the web)"],
        },
        {
          id: "cave-fisher-nest",
          name: "The Cave Fisher Nest",
          description:
            "A wider tunnel chamber where three cave fishers have established a colony, lured into the tunnels by the warmth of the guild's lamp oil stores. They have been preying on anything that enters — including guild members.",
          npcs: ["Three Cave Fishers (Level 2 aberrations; attack with sticky filament strands from 60 feet; reel prey in 10 feet per round)"],
        },
        {
          id: "guild-treasure-cache",
          name: "Guild Treasure Cache",
          description:
            "The guild's real prize — a hidden room behind a false wall containing months of accumulated stolen goods: 400gp in assorted valuables, three magic items (all stolen, all potentially recognizable to their original owners).",
        },
      ],
      keyNPCs: [
        "Sillan (Guild Contact): Nervous, evasive about what specifically is down there; will pay the promised reward but pocket the lockbox contents if possible; loyal to the guild first.",
        "Surviving Guild Member: One person is still alive in the cocoons — wounded but saveable. Will be grateful and share the location of the treasure cache as thanks.",
      ],
      specialMechanics: [
        "Cave Fisher Filament: Range 60 feet. If the filament hits, target is restrained (STR DC 14 to break free or deal 10 damage to filament — AC 12). Cave fisher reels in restrained prey 10 feet per turn. A reeled-in target is devoured on the turn it reaches the fisher.",
        "Stolen Goods Complication: The three magic items in the cache are known stolen property. Using them in public risks recognition. The original owners may offer a reward — or send bounty hunters.",
      ],
    },
    {
      id: "mines-of-gloomwind",
      title: "The Mines of Gloomwind",
      levelMin: 2,
      levelMax: 3,
      synopsis:
        "The miners of Gloomwind Shaft struck something ancient three weeks ago — and the mine went silent. The mining company is offering hazard pay for anyone willing to go in, rescue survivors, and identify what was found.",
      hook: "Gloomwind Mine has gone dark. Forty miners are unaccounted for. The Ironfeld Mining Company will pay 50gp per survivor rescued, and 200gp for a full report on what happened in the deep shaft.",
      pcMapFile: "Mines-of-Gloomwind-PC.png",
      locations: [
        {
          id: "mine-entrance",
          name: "Mine Entrance",
          description:
            "The mine's head-frame towers over the entrance. Equipment is abandoned mid-task — a loaded ore cart, a dropped lunch pail, a smashed lantern. The elevator cage is stuck midway down the shaft.",
          hazards: ["Elevator risk: the cage is hanging by fraying cable; descending requires DEX DC 12 to avoid a 1d6 fall from a cable snap"],
          hasPcMap: true,
        },
        {
          id: "upper-shafts",
          name: "Upper Mine Shafts",
          description:
            "Branching tunnels supported by timber frames, many partially collapsed. Twelve survivors are hiding in a barricaded supply room — they've been there for two days and are terrified to move.",
          npcs: ["12 Surviving Miners (exhausted, one with a broken arm; they know what they found — they beg the party not to go deeper)"],
        },
        {
          id: "deep-shaft",
          name: "The Deep Shaft",
          description:
            "The new tunnel cut by the night shift when they struck the find. The walls here pulse with a faint violet luminescence. Strange markings are carved into the rock — alien geometry that hurts to look at too long.",
          hazards: ["Alien geometry: characters studying the markings for more than 1 minute must make INT DC 12 or take 1d4 psychic damage and be frightened until they look away"],
        },
        {
          id: "the-find",
          name: "The Find",
          description:
            "What the miners discovered: an ancient vault door, cracked open by the drilling. Inside is a sphere of pure darkness — a bound void creature the size of a carriage. It has been slowly absorbing the miners who wandered too close. The remaining missing miners are... gone.",
          npcs: ["Bound Void Creature (Level 5 aberration; immune to non-magical weapons; takes double damage from light spells; can be rebound if the vault door is resealed — requires STR DC 15 push on the door while the creature is distracted)"],
        },
      ],
      keyNPCs: [
        "Foreman Dace: Survivor leader; practical and competent under pressure; knows the mine layout; will help guide the party if they promise to get his people out first.",
        "The Void Creature: It does not communicate in any way mortals can comprehend. It is simply hungry. Sealing it back in the vault is the only non-lethal resolution.",
      ],
      specialMechanics: [
        "Rebinding the Creature: The vault door can be pushed closed while the creature is distracted (occupied consuming something or someone). Two characters must succeed at STR DC 15 simultaneously. The door then seals automatically if shut.",
        "Light Weakness: Spells or effects that produce magical light deal double damage to the Void Creature. Torches and mundane light deal no damage but cause it to recoil (it will avoid lit areas if possible).",
      ],
    },
    {
      id: "monster-under-tower",
      title: "The Monster Under the Tower",
      levelMin: 1,
      levelMax: 2,
      synopsis:
        "A village has been terrorized by something living in the basement of an old wizard's tower. Three people have gone missing. But the monster isn't what anyone expects — and the real danger is the tower itself.",
      hook: "Three villagers have vanished near the old Meldrath Tower. The village headman begs for help. 'The tower has been empty for twenty years,' he says, 'but something has moved in.'",
      pcMapFile: "Monster-under-Tower-PC.png",
      locations: [
        {
          id: "tower-exterior",
          name: "The Tower Exterior",
          description:
            "Meldrath's tower stands on a low hill, its stones black with age. The door is unlocked. A garden of dead herbs surrounds it. Tracks — large, six-toed — lead from the tower door to the village well and back.",
          hasPcMap: true,
        },
        {
          id: "tower-floors",
          name: "Tower Floors (1–3)",
          description:
            "The three floors above ground are a disaster — Meldrath's experiments, abandoned and decaying. Several are still active: a self-stirring cauldron of acidic slime (touching it: 1d4 acid), a bookshelf that hurls books at anyone who approaches (1d4 bludgeoning, Meldrath's defenses), and a cage containing a malnourished displacer beast kitten.",
          npcs: ["Displacer Beast Kitten (non-hostile if offered food; its mother is in the basement — she stole the villagers to feed her young)"],
        },
        {
          id: "tower-basement",
          name: "The Tower Basement",
          description:
            "The 'monster': a displacer beast mother and two other kittens. She moved in after Meldrath died, using the basement as a den. The three missing villagers are here — alive, unharmed, kept like prey in reserve. She attacks if cornered.",
          npcs: ["Displacer Beast (Level 4; her displacement makes attacks against her miss 50% on first attempt; she is protecting her young and will retreat if her kittens are in danger)"],
        },
        {
          id: "meldrath-study",
          name: "Meldrath's Hidden Study",
          description:
            "Behind a false wall on the third floor (INT DC 13 or perception check to find): Meldrath's real notes, a potion of healing, and a wand of force (5 charges). The notes reveal why he left: he discovered the tower was built over a ley line that makes magical experiments unpredictable (doubles the effect of all magic cast here — for better or worse).",
        },
      ],
      keyNPCs: [
        "Displacer Beast Mother: Predatory but not malicious — she is caring for her young. If the kittens are safely relocated, she will follow them away from the tower without further violence.",
        "The Three Villagers: A farmer, a herbalist, and a child. They are scared but healthy. The mother hasn't hurt them — she's been leaving them uneaten, possibly as she decides.",
      ],
      specialMechanics: [
        "Displacement: The displacer beast's displacement means all attack rolls against it have a 50% miss chance on the first attempt each round (roll d6; 1-3 = miss regardless of other results). This chance resets at the start of each of the beast's turns.",
        "Ley Line Magic: Any spell cast inside the tower is rolled twice and the GM chooses which result applies — making powerful spells extremely potent but also extremely unpredictable.",
      ],
    },
    {
      id: "terror-demon-cyst",
      title: "Terror at the Demon Cyst",
      levelMin: 3,
      levelMax: 4,
      synopsis:
        "A demonic cyst has ruptured beneath a crossroads shrine, spilling minor demons into the surrounding area. A temple of Mitra has dispatched a team to seal it — but their team hasn't reported back. A warpriest needs a reliable group to complete the sealing.",
      hook: "Strange shadows and whispered fears have gripped the crossroads village of Thornmeet. The shrine of Mitra is cracked and bleeding black ichor. Warpriest Calandria sent her best people two days ago — silence since.",
      pcMapFile: "Terror-Demon-Cyst-PC.png",
      locations: [
        {
          id: "thornmeet-village",
          name: "Thornmeet Village",
          description:
            "A small crossroads village in the grip of supernatural dread. Doors are barred, children kept inside. The shrine at the center of town weeps black ichor from a crack in its foundation. Two shadow demons have taken up residence in the shrine's bell tower.",
          npcs: ["Two Shadow Demons (Level 3; immune to non-magical weapons; vulnerable to radiant/holy damage; can hide in any shadow)"],
          hasPcMap: true,
        },
        {
          id: "mitra-team-remains",
          name: "The Fallen Team",
          description:
            "Calandria's team of three templars are here — two dead, one barely alive. The survivor, Aldus, has been driven partially mad by the cyst's fear aura. He knows the sealing procedure but must make WIS DC 12 each round to act coherently.",
          npcs: ["Templar Aldus (wounded, partially mad, but functional with support; knows the ritual)"],
        },
        {
          id: "demon-cyst",
          name: "The Demon Cyst",
          description:
            "Beneath the shrine: a 15-foot sphere of calcified demonic matter, cracked open. Minor demons emerge from it every 10 minutes (1d4 dretches per emergence). Sealing it requires pouring consecrated oil on each of three cracks while chanting — 3 full rounds of ritual action, total.",
          npcs: ["Cyst Warden (Level 4 demon; guards the cyst; cannot leave within 30 feet of the cyst; attempts to interrupt the sealing ritual)"],
          hazards: ["Fear Aura: all creatures within 30 feet of the cyst must make WIS DC 13 at the start of each turn or be frightened (must move away from cyst) for 1 round"],
        },
        {
          id: "manifestation-chamber",
          name: "The Manifestation Chamber",
          description:
            "If the sealing ritual is interrupted at the final stage, the cyst spasms and releases a fully-formed Abyssal Manifestation — a demon of concentrated fear. This is the worst-case scenario.",
          npcs: ["Abyssal Manifestation (Level 5 demon; only appears if ritual is fully interrupted; immune to fear; destroying it automatically seals the cyst)"],
        },
      ],
      keyNPCs: [
        "Warpriest Calandria: Awaits outside Thornmeet; grieving her fallen templars; will enter the village to help if the party seems overwhelmed (Level 4 Cleric of Mitra, has one use of mass healing and holy light).",
        "Templar Aldus: Knows the ritual procedure; his madness clears if he can make 3 consecutive WIS DC 12 saves (aided by help action or a calming spell).",
      ],
      specialMechanics: [
        "Sealing Ritual: Three cracks, one action each (pour oil + chant). The ritual resets if all three actions are interrupted before completion. Each crack sealed dims the fear aura by 5 (DC drops from 13 to 8 with all three sealed). The Cyst Warden actively attempts to interrupt each action.",
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
      pcMapFile: "The-Scorchard-PC.jpeg",
      locations: [
        {
          id: "orchard-edge",
          name: "The Orchard Margins",
          description:
            "The outer rows of apple trees are merely sick — yellowed leaves, fruit that smells of smoke. Evidence of heat damage radiates from the center. The orchardist's dog won't enter the orchard.",
          hasPcMap: true,
        },
        {
          id: "sprite-territory",
          name: "The Inner Grove",
          description:
            "The fire sprites are active here — tiny flame-winged creatures about the size of a robin. They flit between the trees, setting small fires accidentally. They are not malicious — they are simply living their normal lives and the orchard is drying out around them.",
          npcs: ["Fire Sprite Colony (20+ sprites; each is Level 0, harmless individually; but frightened fire sprites scatter and set random fires — a frightened colony starts a major fire within 1d4 rounds)"],
          hazards: ["Random fire ignition: any aggressive action toward sprites causes 1d4 nearby trees to ignite, spreading 1 per round until doused"],
        },
        {
          id: "heartwood-tree",
          name: "The Heartwood Tree",
          description:
            "An ancient apple tree, three times the height of any other, its trunk hollow and warm. The sprite queen has her nest inside — a beautiful creature the size of a cat, made entirely of living flame. She chose this tree because it was dying before she arrived; the sprites are not the cause, they are a symptom of something older.",
          npcs: ["Fire Sprite Queen (Level 2; intelligent, can communicate; chose the tree because it was already dying from a blight; will leave peacefully if given an alternative home)"],
        },
        {
          id: "blight-source",
          name: "The Blight Root",
          description:
            "Investigation (INT DC 13 Nature check or the sprite queen's information) reveals the real cause: a deep root blight killing the heartwood tree from below. The sprites are drawn to dying wood. Curing the blight (a herbalist's task, 3-day project) or destroying the heartwood tree will cause the sprites to move on naturally.",
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
      pcMapFile: "The-Tarwell-PC.png",
      locations: [
        {
          id: "north-road",
          name: "The North Road",
          description:
            "The road north runs near the tar pit for half a mile. Tar smears on the road mark where victims were taken. Tracks (deep impressions, oozing black) lead off the road toward the pit.",
          hasPcMap: true,
        },
        {
          id: "tar-pit-edge",
          name: "The Tar Pit Edge",
          description:
            "The rim of the ancient tar pit: a 200-foot-wide depression filled with black, slowly bubbling tar. The smell is overwhelming. Two tar-men guard the rim, slowly patrolling.",
          npcs: ["Two Tar Golems (Level 3 constructs; immune to fire, which heats the tar but doesn't ignite it; slow-moving but impossible to permanently damage unless the Tarwell Matriarch is destroyed; restoring them if destroyed takes 1d4 rounds)"],
          hazards: ["Tar edge: stepping within 5 feet of the pit's edge requires DEX DC 12 or slide into the tar (swimming requires STR DC 14 each round or sink 5 feet per round)"],
        },
        {
          id: "submerged-ruins",
          name: "Submerged Ruins",
          description:
            "Six feet below the tar surface: old stone ruins. The three missing travelers are here — alive, preserved by the tar's strange properties, unconscious. Reaching them requires submerging in the tar.",
          hazards: ["Tar immersion: characters fully submerged in tar take 1d4 suffocation damage per round; they can see nothing and can only navigate by touch"],
        },
        {
          id: "matriarch-chamber",
          name: "The Matriarch's Chamber",
          description:
            "At the pit's lowest point: a stone chamber, ancient, carved with spiral symbols. The Tarwell Matriarch — an ancient black pudding the size of a draft horse that has gained crude intelligence — sits at the center. She is the source of the tar-men. She considers the pit her domain and mortals passing above as intruders.",
          npcs: ["Tarwell Matriarch (Level 5 ooze; immune to slashing and fire; vulnerable to cold; divides when struck by lightning; destroying her deactivates all tar golems instantly)"],
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
      id: "thrice-sealed",
      title: "The Thrice-Sealed Vault",
      levelMin: 3,
      levelMax: 4,
      synopsis:
        "A legendary vault sealed by three mages three hundred years ago has had its first seal mysteriously broken. The Arcane Council fears what might escape if the remaining seals fail. They're offering a substantial sum for the party to enter, identify the threat, and reinforce the seals.",
      hook: "The first seal on the Vault of Three Mages has cracked. The Arcane Council is offering 400gp to a party willing to enter the vault, assess the threat, and prevent the remaining seals from breaking — by any means necessary.",
      pcMapFile: "Thrice-Sealed-PC.png",
      locations: [
        {
          id: "vault-exterior",
          name: "Vault Exterior",
          description:
            "A featureless stone cube, 40 feet on each side, with three enormous iron seals set into the door — each a different color (gold, silver, iron). The gold seal is cracked and leaking a faint yellow mist.",
          hasPcMap: true,
        },
        {
          id: "first-seal-chamber",
          name: "First Seal Chamber (Gold — Broken)",
          description:
            "The chamber behind the first seal: a summoning chamber where a bound creature has been slowly expanding against its binding circle for three centuries. The circle has finally cracked. The creature — a genie-like entity made of golden light — is half-free and half-still-bound.",
          npcs: ["Bound Efreeti (Level 4 fire genie; half-maddened by three centuries of imprisonment; alternates between rage and lucidity; can be re-bound with a new circle — INT DC 15 ritual, 10 minutes, requires chalk and silence)"],
        },
        {
          id: "second-seal-chamber",
          name: "Second Seal Chamber (Silver — Cracking)",
          description:
            "The silver seal is cracking from the pressure of the first seal's failure. Inside: the original mage who designed the vault, preserved in magical stasis, slowly waking. She is three hundred years out of time and does not fully understand that her colleagues are long dead.",
          npcs: ["Mage Elowen (Level 5, friendly but disoriented; has the repair sequence for all three seals in her memory — she sealed herself in with the vault's contents as a last resort; will help if she trusts the party)"],
        },
        {
          id: "third-seal-chamber",
          name: "Third Seal Chamber (Iron — Intact)",
          description:
            "The innermost chamber: an entity so dangerous that the mages never even named it in their notes. It sleeps behind the iron seal. Waking it would be catastrophic. The seal is intact — and must stay that way.",
          hazards: ["Dream leak: even through the intact seal, the entity's dreams radiate. Any character who sleeps within the vault has nightmares and must make WIS DC 14 or gain 1 level of exhaustion."],
        },
      ],
      keyNPCs: [
        "Mage Elowen: The vault's designer, three centuries out of time; grieving (she doesn't yet know her colleagues are dead); will share all she knows if treated with compassion; holds the master seal repair sequence.",
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
      pcMapFile: "Vault-Once-Great-Thief-PC.png",
      locations: [
        {
          id: "vault-entrance",
          name: "The Cellar Entrance",
          description:
            "A stone door behind a wine rack, triggered by pulling a specific bottle (WIS DC 12 to notice the worn label, or INT DC 14 to puzzle it out). The vault beyond is Aldara's masterwork — a series of rooms each guarded by a trap that she personally designed.",
          hasPcMap: true,
        },
        {
          id: "trap-corridor",
          name: "The Hall of Aldara's Pride",
          description:
            "A long corridor with six distinct traps: pressure plates (DEX DC 12 to detect and disable), tripwires (INT DC 13), a false floor (WIS DC 14 to spot the discoloration), a spinning blade wall section (DEX DC 14 to dodge, 2d6 damage), a gas nozzle (CON DC 12 or sleep 1 hour), and a mirror that casts a fear illusion (WIS DC 13 or frightened 1 round).",
          hazards: ["Multiple traps: listed above"],
        },
        {
          id: "puzzle-room",
          name: "Aldara's Puzzle Room",
          description:
            "A room with the walls covered in tiny drawers — hundreds of them. Only one holds a key. The correct drawer can be identified by a cipher scratched on the ceiling (INT DC 14 to decode). The wrong drawers contain: nothing, a smoke bomb, a dye explosion (marks skin bright purple for a week), or a needle trap.",
          hazards: ["Wrong drawer: 50% nothing, 25% smoke bomb, 15% dye, 10% needle (CON DC 12 or sleep 1 hour)"],
        },
        {
          id: "aldara-vault",
          name: "The Final Vault",
          description:
            "The payoff: Aldara's greatest haul. 2,000gp in gold coins (heavy — requires multiple trips or a strong party), three genuine magic items, a ledger of all her scores (potentially valuable to blackmailers or law enforcement), and a personal letter to 'whoever is clever enough to get here,' congratulating them.",
        },
      ],
      keyNPCs: [
        "Aldara Pell (deceased): Communicated through the vault design itself — she clearly enjoyed building this. The congratulatory letter reveals a sharp wit and genuine respect for anyone who makes it through.",
        "The New Estate Owner: Hires the party; trustworthy about the 20% cut; will have the gold counted and weighed. Becomes a useful patron if treated fairly.",
      ],
      specialMechanics: [
        "Trap Detection: All traps in the corridor can be detected with the appropriate skill check before triggering. Rushing through without checking triggers each trap automatically. The party can safely disable a trap with 1 minute of work after detecting it.",
        "Ledger Value: The blackmail ledger contains names of 12 current city officials who hired Aldara. Selling it to a criminal organization yields 500gp; turning it over to law enforcement yields 300gp and a favor; keeping it provides potential leverage.",
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
      pcMapFile: "Warrens-Deepwood-King-PC.png",
      locations: [
        {
          id: "forest-approach",
          name: "The Deepwood Approach",
          description:
            "The forest outside Millhaven, patrolled by goblin scouts. Three patrol pairs can be spotted and avoided (WIS DC 12 per pair) or ambushed (STR or DEX to strike first). One patrol carries a message written in broken Common — evidence that the Deepwood King is receiving instructions from a third party.",
          npcs: ["Three goblin scout pairs (Level 1 each, cowardly if outnumbered 2-to-1)"],
          hasPcMap: true,
        },
        {
          id: "warren-entrance",
          name: "The Warren Entrance",
          description:
            "An old badger sett expanded into a proper warren entrance, disguised with brush and dead wood. Inside: the warrens are well-maintained, with crude but effective fortifications. The Deepwood King's warband has proper equipment — too good for goblins.",
          npcs: ["Warren Guard (4 goblins with crossbows, Level 1)"],
        },
        {
          id: "throne-room",
          name: "The Deepwood King's Throne Room",
          description:
            "A surprisingly well-decorated chamber for a goblin warren. The Deepwood King sits on a throne made of stolen furniture — a goblin who has clearly been given money, weapons, and direction from outside. Two goblin champions flank him. His ledger contains the name of his patron.",
          npcs: ["The Deepwood King (Level 3 goblin warchief; intelligent, paranoid, and outmaneuvered if his patron is revealed to him)", "Two Goblin Champions (Level 2)"],
        },
        {
          id: "hidden-meeting-room",
          name: "The Secret Meeting Room",
          description:
            "A side chamber not marked on any goblin's map — used by the Deepwood King's patron for their meetings. Contains correspondence revealing the patron: a Millhaven merchant who hired the goblins to raid his competitors and blame the raids on the forest folk.",
          hazards: ["Concealed: INT DC 14 or WIS DC 14 to find the door"],
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
      pcMapFile: "Word-Eating-Wyrm-PC.png",
      locations: [
        {
          id: "library-main",
          name: "The Grand Archivum",
          description:
            "Five floors of shelved books, scrolls, and manuscripts. Evidence of the wyrm's activity: missing sections, fine powdery residue (digested vellum), and strange circular holes in the floor of the restricted section. The wyrm travels through the building's stone by consuming the material around it.",
          hasPcMap: true,
        },
        {
          id: "restricted-section",
          name: "The Restricted Collection",
          description:
            "The section housing the Archivum's most dangerous texts — magical compendiums and forbidden lore. The wyrm has eaten several, giving it access to multiple magical effects. The floor here has the largest holes.",
          hazards: ["Unstable floor: several sections of floor are weakened by the wyrm's tunnels; moving quickly requires DEX DC 12 or fall through (10-foot drop, 1d6 damage)"],
        },
        {
          id: "sub-basement",
          name: "The Sub-Basement",
          description:
            "Beneath the library: the original building's cellar, repurposed as overflow storage for unsorted acquisitions. The wyrm's nest is here — a circular chamber it has eaten out of the foundation stone, surrounded by piles of digested book-dust.",
          npcs: ["The Word-Eating Wyrm (Level 5 aberration; has consumed 47 books, granting it INT 18 and the ability to cast any spell from those books once per day; vulnerable to silence — it cannot eat in silence)"],
        },
        {
          id: "knowledge-core",
          name: "The Knowledge Core",
          description:
            "At the wyrm's center: a glowing mass of condensed knowledge — the distilled essence of every book it has consumed. Extracting this core (without killing the wyrm) is possible (DEX DC 15 while the wyrm is incapacitated) and yields an object worth 500gp to the right buyer.",
        },
      ],
      keyNPCs: [
        "Head Archivist Petra: Determined to preserve the collection; prefers the wyrm removed alive if possible (she's curious about it); will pay 300gp for removal without library damage, 200gp for any removal, 50gp for 'you burned half the place' damage.",
        "The Word-Eating Wyrm: Not evil — just hungry. Its intelligence has been growing as it consumes more books. A character who can communicate with it (via Speak with Animals or similar) discovers it is becoming self-aware and afraid of its own hunger.",
      ],
      specialMechanics: [
        "Silence Weakness: The wyrm cannot eat in a zone of magical silence. A silence spell or the Silence scroll (found in the restricted section, INT DC 12 to identify) instantly stops the wyrm from moving and feeding. It will attempt to leave the silenced area.",
        "Spell Absorption: The wyrm has consumed 47 books. Once per encounter, it can cast any spell from those books (GM's choice, tier 1-3). Track its remaining spell uses — it started with 5 random spells and loses one each time it casts.",
      ],
    },
  ],
};
