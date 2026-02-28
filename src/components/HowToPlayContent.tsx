import Link from "next/link";

export function HowToPlayContent() {
  return (
    <div className="space-y-7 text-sm text-stone-300 leading-relaxed">

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-stone-500">
          The Game Master
        </h2>
        <p>
          ShadowDork&apos;s AI Game Master runs the{" "}
          <span className="text-stone-200">Shadowdark RPG</span> rules on your behalf. It
          generates the world, plays every NPC and monster, and adjudicates outcomes — exactly
          as a human GM would at a table. You don&apos;t need to know the rules; the GM handles
          all of that behind the scenes.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-stone-500">
          Dice &amp; Fate
        </h2>
        <p className="mb-3">
          The GM rolls dice constantly. Monster attacks, trap triggers, NPC reactions, random
          encounters — all resolved using Shadowdark&apos;s rules. Some rolls the GM will narrate
          openly: <span className="text-stone-400 italic">"The orc swings and rolls a 14 — it connects."</span> Others
          tumble away into the impenetrable mists, their outcomes known only through what happens
          next in the story.
        </p>
        <p>
          When <span className="text-stone-200">you</span> need to roll — an attack, a stat check,
          a saving throw — the GM will tell you exactly what to roll and what number you&apos;re
          aiming for. At that point you have two options:
        </p>
        <ul className="mt-2 ml-4 list-disc space-y-1 text-stone-400">
          <li>Reach for your <span className="text-stone-200">real dice</span> and report your result to the GM</li>
          <li>Use the <span className="text-stone-200">Dice Roller</span> in the right sidebar</li>
        </ul>
        <p className="mt-2 text-stone-400">
          Either way, tell the GM what you rolled and the story continues.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-stone-500">
          Your Choices Are Always Yours
        </h2>
        <p>
          The GM describes the world and the consequences of your actions, but{" "}
          <span className="text-stone-200">what you do is entirely up to you</span>. The GM will
          never decide your actions for you, and you are never locked into a path. Describe your
          actions in as much or as little detail as you like — <em>"I attack"</em> works just
          as well as a paragraph of vivid description.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-stone-500">
          Out of Character Prompts
        </h2>
        <p className="mb-3">
          At any point you can step outside the fiction and give the GM a direct instruction
          using <span className="text-stone-200">square brackets</span>. These are called{" "}
          <span className="text-stone-200">OOC (Out of Character)</span> prompts. The GM will
          acknowledge and adjust immediately — no in-game justification required.
        </p>
        <div className="rounded border border-stone-700 bg-stone-900 px-4 py-3 space-y-1.5 font-mono text-xs text-stone-400">
          <p>[OOC please leave more decisions up to me]</p>
          <p>[OOC don&apos;t offer me choices, let me direct my own actions]</p>
          <p>[OOC be more descriptive]</p>
          <p>[OOC be less descriptive, shorter responses]</p>
          <p>[OOC I&apos;d like to avoid combat right now]</p>
          <p>[OOC remind me what I can see in this room]</p>
          <p>[OOC summarize what&apos;s happened so far]</p>
          <p>[OOC I want to end the session here]</p>
        </div>
        <p className="mt-2 text-stone-400">
          Use OOC prompts freely whenever you want to adjust the pacing, tone, or style of play.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-stone-500">
          A Few More Things
        </h2>
        <ul className="ml-4 list-disc space-y-2 text-stone-400">
          <li>
            <span className="text-stone-200">Sessions persist.</span> Your character and world
            state are saved automatically after every GM response. Come back days later and
            pick up exactly where you left off.
          </li>
          <li>
            <span className="text-stone-200">Torch &amp; time.</span> Shadowdark uses real-time
            torches — your light burns down in actual minutes. The torch timer in the sidebar
            tracks this. Don&apos;t get caught in the dark.
          </li>
          <li>
            <span className="text-stone-200">The character sheet</span> in the left panel updates
            live as the GM tracks your HP, inventory, and XP.
          </li>
          <li>
            <span className="text-stone-200">Death is real</span> in Shadowdark. If your character
            dies, you may have options — but there are no guaranteed saves.
          </li>
        </ul>
      </section>

      <p className="text-xs text-stone-600">
        Need a refresher mid-adventure? This guide is always available at{" "}
        <Link href="/how-to-play" className="text-stone-500 hover:text-stone-300 transition-colors underline">
          /how-to-play
        </Link>
        .
      </p>

    </div>
  );
}
