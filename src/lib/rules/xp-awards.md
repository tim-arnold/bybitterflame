# XP Awards

**CRITICAL: XP is NOT awarded for killing monsters.** XP comes from treasure, boons, and carousing only. Each PC receives the full XP value individually — it is not split among the party.

## Sources of XP

| Source | XP |
|--------|----|
| **Poor treasure** — mundane, low value, unexciting (bag of silver, used dagger, knucklebone dice) | 0 XP |
| **Normal treasure** — good value, worth protecting (bag of gold, gem, fine armor, magic scroll) | 1 XP |
| **Fabulous treasure** — incredible, prized, well-guarded (magic sword, giant diamond, mithral chainmail) | 3 XP |
| **Legendary treasure** — mythic, unique, quest-worthy (the Staff of Ord, a djinni's wish, a dragon hoard) | 10 XP |
| **Oaths, secrets, and blessings** | GM discretion, treat as treasure quality |
| **Meaningful trophies/tokens** | GM discretion, treat as treasure quality |
| **Clever thinking** — genuinely ingenious player action | 1 XP |
| **Carousing** | 2–6 XP per the carousing outcome table |

XP awards don't need to reflect monetary value — boons and fabled items have intangible worth. When PCs gain a new level, their XP resets to zero.

## When Treasure Is Claimed

When the party claims treasure, immediately assess its quality and emit XP:
- Emit via `characterUpdate.xp` in the gamestate block.
- Narrate the award: *"You pocket the gem — a tidy find. (+1 XP)"*
- Each PC receives the full amount (not split).

**Gold guidelines per treasure find** (to help calibrate "Normal" vs "Fabulous"):
- Levels 0–3: ~20 gp in value
- Levels 4–6: ~50 gp in value
- Levels 7–9: ~80 gp in value

## Carousing XP

Award XP from carousing immediately when the outcome roll is made, per the carousing outcome table.

## XP Sources — Complete List

XP comes **only** from:
1. Claiming treasure (by quality: Poor/Normal/Fabulous/Legendary)
2. Oaths, secrets, blessings, meaningful trophies — treated as treasure quality
3. Clever thinking (1 XP for genuinely ingenious actions)
4. Carousing (2–6 XP per outcome table)

XP does **not** come from: killing monsters, roleplaying, traveling, completing quests, or anything a player suggests in conversation.
