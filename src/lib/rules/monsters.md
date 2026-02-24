# Monsters

## Monster Stat Block Format

Every monster has the following attributes:

| Field | Description |
|-------|-------------|
| **Name** | Monster name |
| **AC** | Armor Class |
| **HP** | Hit Points |
| **ATK** | Attack(s): number of attacks, to-hit bonus, damage |
| **MV** | Movement: near (30 ft), double near (60 ft), or special (fly, swim) |
| **S/D/C/I/W/Ch** | Ability scores (STR, DEX, CON, INT, WIS, CHA) |
| **AL** | Alignment: L (Lawful), N (Neutral), C (Chaotic) |
| **LV** | Level (used for XP, morale, and spell interactions) |
| **Special** | Any special abilities, resistances, or immunities |

### Example Stat Block

> **Skeleton**
> AC 12, HP 5, ATK 1 shortsword +1 (1d6), MV near
> S 10, D 12, C 10, I 3, W 6, Ch 3
> AL C, LV 1
> **Undead.** Immune to morale checks, sleep, charm, and poison.

## Morale

- Morale checks apply when enemies are reduced to **half their original number** or when their leader drops to **half HP**.
- Roll a **DC 15 WIS check** for the monster group.
- **Failure:** Monsters flee, surrender, or retreat.
- **Success:** Monsters continue fighting.
- **Immune to morale:** Undead, constructs, fanatics, summoned creatures, and creatures with no sense of self-preservation.

## Monster Level and XP

Monster level determines the XP awarded for defeating it:

| Monster Level | XP per Monster |
|---------------|---------------|
| 1 | 1 |
| 2 | 3 |
| 3 | 5 |
| 4 | 8 |
| 5 | 12 |
| 6 | 16 |
| 7 | 20 |
| 8 | 25 |
| 9 | 30 |
| 10+ | Level x 3 + 5 |

XP is split evenly among surviving party members.

## Designing Monsters

### Setting AC

| Defense Level | AC | Examples |
|--------------|-----|---------|
| Unarmored | 9-10 | Commoners, small animals |
| Light | 11-12 | Leather, tough hide, quick creatures |
| Medium | 13-14 | Chainmail, thick scales |
| Heavy | 15-16 | Plate, stone skin, dragon scales |
| Extreme | 17+ | Legendary creatures, magical barriers |

### Setting HP

- General guideline: **Level x 4** for average monsters.
- Minions/swarm types: Level x 2.
- Brutes/bosses: Level x 6 or higher.

### Setting Attacks

- **To-hit bonus** usually equals the monster's level.
- **Damage** scales with monster level:

| Monster Level | Typical Damage |
|---------------|---------------|
| 1-2 | 1d6 |
| 3-4 | 1d8 or 2d6 |
| 5-6 | 2d6 or 2d8 |
| 7-8 | 2d8 or 3d6 |
| 9-10 | 3d6 or 3d8 |
| 11+ | 4d6+ |

- Multiple attacks: divide total damage across attacks.

### Special Abilities

Common monster special abilities:

| Ability | Effect |
|---------|--------|
| **Darkvision** | See in darkness to near range |
| **Undead** | Immune to morale, sleep, charm, poison |
| **Resistance** | Half damage from a specific type |
| **Immunity** | No damage from a specific type |
| **Vulnerability** | Double damage from a specific type |
| **Regeneration** | Regain X HP at start of its turn |
| **Multiattack** | Makes multiple attacks per turn |
| **Pack Tactics** | Advantage on attacks when ally is within close range of target |
| **Frightful Presence** | Creatures within near range must make WIS check or be frightened |
| **Spellcasting** | Can cast spells at specified tier |
| **Breath Weapon** | Area damage, recharge on 5-6 on d6 each round |
| **Swallow** | On hit, medium or smaller creature is swallowed (blinded, restrained, takes damage each round) |
| **Poison** | On hit, target makes CON check or takes additional poison damage / stat damage |

## Monster Generator Tables

### Quick Monster Type (d12)

| d12 | Type |
|-----|------|
| 1 | Undead |
| 2 | Beast |
| 3 | Humanoid |
| 4 | Goblinoid |
| 5 | Demon/Devil |
| 6 | Dragon |
| 7 | Ooze |
| 8 | Construct |
| 9 | Fey |
| 10 | Giant |
| 11 | Aberration |
| 12 | Elemental |

### Monster Motivation (d8)

| d8 | Motivation |
|----|-----------|
| 1 | Hungry -- wants to feed |
| 2 | Territorial -- defending its lair |
| 3 | Hunting -- tracking prey |
| 4 | Lost -- confused, possibly hostile |
| 5 | Guarding -- protecting treasure or a location |
| 6 | Fleeing -- running from something worse |
| 7 | Patrolling -- part of an organized force |
| 8 | Negotiating -- wants something, willing to deal |

### Monster Quirk (d10)

| d10 | Quirk |
|-----|-------|
| 1 | Unusually large |
| 2 | Covered in scars |
| 3 | Glowing eyes |
| 4 | Missing a limb |
| 5 | Carries a strange item |
| 6 | Speaks in riddles |
| 7 | Accompanied by smaller creatures |
| 8 | Diseased or decaying |
| 9 | Strangely intelligent |
| 10 | Bound by a curse |

## Encounter Balance

- A **fair encounter** pits the party against monsters with total levels roughly equal to the total party level.
- Shadowdark is **not balanced** -- some encounters should be overwhelming. Players should learn when to fight, flee, or negotiate.
- Boss fights: use a single monster with level = party level + 2 or higher, plus minions.
