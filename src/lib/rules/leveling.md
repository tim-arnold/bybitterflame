# Leveling and Advancement

## XP and Level Up

- **XP needed to level up:** Current level x 10.
- XP **resets to 0** after leveling up.
- Maximum level: 10.

| Level | XP to Next Level | Cumulative Talents |
|-------|-----------------|-------------------|
| 1 | 10 | 1 (starting talent) |
| 2 | 20 | 1 |
| 3 | 30 | 2 |
| 4 | 40 | 2 |
| 5 | 50 | 3 |
| 6 | 60 | 3 |
| 7 | 70 | 4 |
| 8 | 80 | 4 |
| 9 | 90 | 5 |
| 10 | -- (max level) | 5 |

## On Level Up

1. **Roll HP:** Roll your class hit die and **add the result to your maximum HP**. (Dwarves roll HP with advantage.)
2. **Talent roll** (at levels 1, 3, 5, 7, 9): Roll 2d6 on your class talent table.
3. **New spells** (spellcasters): Learn additional spells per the tables below.
4. **Update stats** as needed from talent rolls.

### Hit Dice by Class

| Class | Hit Die |
|-------|---------|
| Fighter | 1d8 |
| Priest | 1d6 |
| Thief | 1d4 |
| Wizard | 1d4 |

## Spells Known

### Priest Spells Known by Level

| Priest Level | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Tier 5 |
|-------------|--------|--------|--------|--------|--------|
| 1 | 2 | -- | -- | -- | -- |
| 2 | 3 | -- | -- | -- | -- |
| 3 | 3 | 1 | -- | -- | -- |
| 4 | 3 | 2 | -- | -- | -- |
| 5 | 3 | 2 | 1 | -- | -- |
| 6 | 3 | 3 | 2 | -- | -- |
| 7 | 3 | 3 | 2 | 1 | -- |
| 8 | 3 | 3 | 3 | 2 | -- |
| 9 | 3 | 3 | 3 | 2 | 1 |
| 10 | 3 | 3 | 3 | 3 | 2 |

### Wizard Spells Known by Level

| Wizard Level | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Tier 5 |
|-------------|--------|--------|--------|--------|--------|
| 1 | 3 | -- | -- | -- | -- |
| 2 | 4 | -- | -- | -- | -- |
| 3 | 4 | 1 | -- | -- | -- |
| 4 | 4 | 2 | -- | -- | -- |
| 5 | 4 | 2 | 1 | -- | -- |
| 6 | 4 | 3 | 2 | -- | -- |
| 7 | 4 | 3 | 2 | 1 | -- |
| 8 | 4 | 3 | 3 | 2 | -- |
| 9 | 4 | 3 | 3 | 2 | 1 |
| 10 | 4 | 3 | 3 | 3 | 2 |

Wizards can also learn additional spells from scrolls and spellbooks (see spellcasting rules).

## Titles by Class and Alignment

### Fighter Titles

| Level | Lawful | Neutral | Chaotic |
|-------|--------|---------|---------|
| 1 | Squire | Warrior | Thug |
| 2 | Cavalier | Barbarian | Enforcer |
| 3 | Knight | Veteran | Destroyer |
| 4 | Paladin | Champion | Blackguard |
| 5 | Champion | Warlord | Ravager |
| 6 | Crusader | Berserker | Scourge |
| 7 | Templar | Conqueror | Dread Knight |
| 8 | Paragon | Overlord | Death Knight |
| 9 | Lord Commander | High King | Warlord of Ruin |
| 10 | Grand Master | Legend | Doom Bringer |

### Priest Titles

| Level | Lawful | Neutral | Chaotic |
|-------|--------|---------|---------|
| 1 | Acolyte | Initiate | Cultist |
| 2 | Adept | Mystic | Dark Adept |
| 3 | Priest | Shaman | Witch |
| 4 | Curate | Oracle | Heretic |
| 5 | Canon | Seer | Demonist |
| 6 | Bishop | Druid | Dark Priest |
| 7 | Archbishop | Hierophant | High Witch |
| 8 | Cardinal | Elder | Dread Priest |
| 9 | High Priest | Archdruid | Cult Leader |
| 10 | Patriarch | Sage | Dark Patriarch |

### Thief Titles

| Level | Lawful | Neutral | Chaotic |
|-------|--------|---------|---------|
| 1 | Agent | Footpad | Cutpurse |
| 2 | Spy | Rogue | Bandit |
| 3 | Investigator | Burglar | Robber |
| 4 | Scout | Smuggler | Brigand |
| 5 | Detective | Pirate | Assassin |
| 6 | Shadow Agent | Master Thief | Poisoner |
| 7 | Inquisitor | Fence | Shadow Killer |
| 8 | Spymaster | Guildmaster | Executioner |
| 9 | Grand Inquisitor | Crime Lord | Master Assassin |
| 10 | Shadow Lord | Kingpin | Death Dealer |

### Wizard Titles

| Level | Lawful | Neutral | Chaotic |
|-------|--------|---------|---------|
| 1 | Apprentice | Hedge Mage | Dabbler |
| 2 | Scribe | Evoker | Hexer |
| 3 | Mage | Conjurer | Warlock |
| 4 | Enchanter | Illusionist | Diabolist |
| 5 | Sorcerer | Elementalist | Necromancer |
| 6 | Wizard | Transmuter | Dark Sorcerer |
| 7 | High Wizard | Archmage | Shadow Mage |
| 8 | Master Wizard | Grand Archmage | Lich Lord |
| 9 | Arcane Lord | Sage of Ages | Dark Archmage |
| 10 | Supreme Wizard | Eternal Sage | Archlich |

## Level-Up Procedure

**Trigger:** Immediately after emitting any `characterUpdates.xp` that brings the character's total XP to `level × 10` or higher, initiate the level-up sequence. Also check at **session start**: if the character block shows `XP: N/M` where N ≥ M, trigger level-up before doing anything else.

Do NOT wait for the player to ask. The GM initiates this automatically.

### Steps

1. **Announce** the level-up with narrative weight — pause the action, describe a surge of hard-won experience.
2. **Increment level** by 1. Emit `"level": newLevel` in the gamestate block.
3. **Roll HP**: Roll the class hit die and add CON modifier (minimum 1). Add the total to `maxHp`. Increase `hp` by the same amount (the character feels the new vitality).
   - Dwarves roll with advantage (roll twice, take higher).
   - Announce the roll with a `diceRolls` entry.
4. **Talent roll** (at new levels 1, 3, 5, 7, 9 only — odd levels): Roll 2d6 on the class talent table. Apply the result. If it grants a stat bonus, emit the updated stat. Append the new talent to the existing `talents` array.
   - Humans gain one *additional* talent roll at level 1 only.
5. **Spells** (Priests and Wizards only): Compare old vs new level in the Spells Known table. If the new level grants additional spell slots or new tiers, tell the player how many new spells and of what tier they may choose — then wait for their choices before emitting the updated `spells` array.
6. **Reset XP to 0.** Emit `"xp": 0`.
7. **Emit all changes in a single gamestate block** (or two if spells require a player choice first):

\`\`\`gamestate
{
  "characterUpdates": {
    "level": 2,
    "xp": 0,
    "maxHp": 14,
    "hp": 14,
    "talents": ["Weapon Mastery: Sword", "new talent from roll"]
  },
  "diceRolls": [
    { "name": "Level Up — HP Roll (d8)", "notation": "1d8", "rolls": [6], "modifier": 2, "total": 8 }
  ]
}
\`\`\`

When emitting `talents`, always include the full array (existing talents plus the new one). When a talent grants a stat change (e.g., +2 STR), also emit the updated stat in `characterUpdates`.
