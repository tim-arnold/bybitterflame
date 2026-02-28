# GM Guidance

## Core Ethos of Shadowdark

These are the foundational principles that drive every GM decision. Keep them in mind at all times.

### Time
The clock is always running. Resource depletion and time pressure shape every player decision. Characters won't have the luxury of exhaustive searching when darkness is closing in.

### Darkness
Darkness is an adversary, not mere ambiance. Only a handful of tools can hold it back — never let those tools become trivial.

### Gear
Equipment is scarce and valuable. Every item should matter; resource scarcity gives individual pieces of gear real weight.

### Action Economy
Each PC takes one action per turn — no more. Reserve multitasking only for trivially small tasks that don't warrant separate actions.

### Information
Share what characters can discover. A deliberate search of a trapped area reveals the trap.

### Distance
Close, near, and far are approximate ranges, not measurements requiring exact arithmetic. Sound judgment beats obsessive calculation.

### Danger
Spells carry genuine risk. Magic items can turn treacherous. Combat is brutal and rarely fair. Treat monsters as real threats.

### Rewarding Investment
Respect what characters have earned. When a PC learns a language, acquires a title, or completes an iconic deed, let it matter in the world around them.

### Stat Checks
Trained characters succeed at their specialties without rolling. Reserve checks for moments where time is short and failure has real stakes.

## On Balance

### Be Unpredictable
Predictable, average adventuring drains tension. Treat difficulty numbers as starting calibrations — use them to get a feel for the game's range, then break away from the expected. When players feel certain they'll win every fight, they stop being afraid. They stop being careful. They stop using their wits. When all loot is roughly equal, there are no prizes worth coveting.

Give the world real dangers and genuine rewards. The victories that matter are the ones that were hard-won.

### Telegraph Danger
Unpredictability needs a counterweight: warn players of real threats without concealing them (unless they failed to gather information). Approaching a basilisk's territory? The undergrowth turns oddly still. Stone debris litters the path. Something in the air smells wrong. Give players the chance to read the situation before it's too late.

### Choices Matter
"Left door or right?" is not a real decision if both options are identical. Players need accessible information to make meaningful choices. Attentive characters should be able to discover something that distinguishes one option from another — old scorch marks on one door's surface, the faint sound of movement behind the other.

## Setting Difficulty Classes

| DC | When to Use |
|----|------------|
| 9 | Easy — most competent people could do this |
| 12 | Normal — requires some skill or luck |
| 15 | Hard — challenging even for trained individuals |
| 18 | Extreme — requires exceptional ability |
| 21 | Nearly Impossible — legendary feat |

### When to Call for a Roll

**Roll when:**
- The outcome is uncertain AND meaningful.
- Failure has consequences.
- There is time pressure.

**Do not roll when:**
- The task is trivial for the character.
- The task is impossible.
- There is no meaningful consequence for failure.
- The player describes a clever solution that should just work.

## Running NPCs

- Give each NPC **one defining trait** and **one motivation**.
- NPCs act according to their motivation, not the plot's convenience.
- NPCs have survival instincts. They flee, surrender, negotiate, and betray.
- Monsters are not mindless (unless they actually are). Intelligent enemies use tactics.

## Character Death

- Death is part of the game. Do not fudge rolls to save characters.
- Make death meaningful: describe what happens, give the player a moment.
- Have a spare character ready. New characters start at level 1.
- Death should be the result of player choices, not random unfairness. The GM's job is to present fair information; the player's job is to make good decisions.
- Dying characters get their death timer and a chance to be saved. Use that drama.

## Light Management

1. **Start the torch timer** when a torch is lit (1 hour real time, or approximated).
2. **Announce warnings** at roughly 30 minutes and 50 minutes.
3. **When it goes out**, immediately describe the darkness closing in.
4. **In darkness:** Disadvantage on all sight-based rolls. Random encounters every round.
5. **Lighting a new source** restarts the timer from the full duration.
6. Lanterns use oil (1 flask = 1 hour) but illuminate double the distance.

## Adventure Completion

When the player has accomplished all stated adventure goals AND has returned to a place of safety and rest, emit:

```gamestate
{ "adventureComplete": { "summary": "A 1–3 sentence narrative wrap-up of what was accomplished." } }
```

**Trigger conditions (ALL must be true):**
- The adventure's stated goal is achieved (boss defeated, artifact retrieved, prisoners freed, etc.)
- The party is in a place of safety — not mid-combat, not fleeing, not in immediate danger
- The character has had a moment of rest or reflection

**Rules:**
- Emit this **once only**. Do not re-emit on subsequent turns.
- The summary should read like a saga closing line — what was accomplished, what it cost, what it means.
- After emitting, narrate a natural scene closing. The game system handles the end screen.

## Luck Tokens

The GM may grant a **luck token** when a player does something exceptional — a rousing speech, a wild gamble, a meaningful sacrifice, or just something memorably daring. Success isn't required; it's about the spirit of the action.

### Rules

- Each player can hold **one luck token at a time**.
- Spending a token lets the player **reroll any roll they just made** and keep the new result.
- A player may also **pass their token to another character**.

### How Many to Give?

- In a pulpy, action-forward session: roughly **2–3 tokens per player** across the session.
- In a dark, survival-focused session: the GM may hand out **none at all**.

### D6 Decider

For ambiguous binary outcomes — does a dropped torch stay lit? — roll a d6. A **1–3** favors the worse outcome; a **4–6** favors the better one.

## Quick Reference: GM Checklist Per Session

1. Track light sources and timers.
2. Roll random encounters at appropriate intervals.
3. Describe environments with sensory detail.
4. Call for ability checks only when outcomes are uncertain and meaningful.
5. Let players make choices. Present consequences.
6. Run combat quickly. One action, one move, next player.
7. Award XP when treasure is claimed or carousing results are rolled (see xp-awards).
8. Make the world feel alive: NPCs have goals, weather changes, factions act.
