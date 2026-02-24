"use client";

import { useMemo, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { DiceRollDisplay } from "./DiceRollDisplay";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

const GAMESTATE_REGEX = /```gamestate\s*\n([\s\S]*?)```/g;

/** Strip gamestate blocks from content and extract dice rolls */
function processContent(content: string) {
  const diceRolls: { name?: string; notation: string; rolls: number[]; total: number }[] = [];
  let narrative = content;

  const matches = [...content.matchAll(GAMESTATE_REGEX)];
  for (const match of matches) {
    narrative = narrative.replace(match[0], "");
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed.diceRolls && Array.isArray(parsed.diceRolls)) {
        for (const roll of parsed.diceRolls) {
          if (roll.rolls && Array.isArray(roll.rolls) && typeof roll.total === "number") {
            diceRolls.push({
              name: roll.name,
              notation: roll.notation ?? "",
              rolls: roll.rolls,
              total: roll.total,
            });
          }
        }
      }
    } catch {
      // skip unparseable blocks
    }
  }

  narrative = narrative.replace(/\n{3,}/g, "\n\n").trim();
  return { narrative, diceRolls };
}

/** Strip incomplete gamestate blocks that are still being streamed */
function stripStreamingGamestate(content: string): string {
  // Remove complete gamestate blocks
  let cleaned = content.replace(GAMESTATE_REGEX, "");
  // Remove incomplete gamestate block at the end (opened but not yet closed)
  cleaned = cleaned.replace(/```gamestate\s*\n[\s\S]*$/, "");
  // Also catch the opening fence while it's being typed
  cleaned = cleaned.replace(/```game(s(t(a(t(e)?)?)?)?)?$/, "");
  return cleaned.replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Split narrative at the first `---` horizontal rule.
 * Tolerant of surrounding blank lines and optional trailing whitespace on the `---` line.
 */
function splitAtRule(narrative: string): [string, string | null] {
  const match = narrative.match(/^([\s\S]*?)\n\s*---\s*\n([\s\S]*)$/);
  if (!match) return [narrative, null];
  const before = match[1].trim();
  const after = match[2].trim();
  if (!before || !after) return [narrative, null];
  return [before, after];
}

const narrativeBaseClass =
  "narrative text-stone-200 leading-relaxed prose prose-invert prose-stone max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-strong:text-[var(--color-gold)] prose-em:text-stone-300 prose-headings:text-[var(--color-gold)]";

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const [diceComplete, setDiceComplete] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const onDiceComplete = useCallback(() => setDiceComplete(true), []);
  const onReveal = useCallback(() => setRevealed(true), []);

  const { narrative, diceRolls } = useMemo(() => {
    if (isStreaming) {
      // Once a ```gamestate fence appears in the stream (even before the block
      // is complete), suppress ALL narrative. This prevents the text flash that
      // happens when narrative streams in before dice, then hides for animation.
      // The same component instance will re-render with isStreaming=false once
      // streaming finishes, at which point dice are extracted and animated.
      if (/```gamestate/.test(content)) {
        return { narrative: "", diceRolls: [] };
      }
      return { narrative: stripStreamingGamestate(content), diceRolls: [] };
    }
    return processContent(content);
  }, [content, isStreaming]);

  const hasDice = diceRolls.length > 0;
  const [part1, part2] = useMemo(
    () => (hasDice ? splitAtRule(narrative) : [narrative, null]),
    [narrative, hasDice],
  );
  const hasPhases = hasDice && part2 !== null;

  if (role === "user") {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[80%] rounded-lg px-4 py-3 bg-stone-800 border border-stone-700 text-stone-200">
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    );
  }

  // Streaming with suppressed narrative (gamestate detected) — show waiting indicator
  if (isStreaming && !narrative) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">
            Game Master
          </span>
        </div>
        <div className="flex items-center gap-2 text-stone-500">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-[var(--color-gold-dim)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 bg-[var(--color-gold-dim)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 bg-[var(--color-gold-dim)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="text-sm">The fates are being decided...</span>
        </div>
      </div>
    );
  }

  // No dice — render everything immediately
  if (!hasDice) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">
            Game Master
          </span>
        </div>
        <div className={`${narrativeBaseClass}`}>
          <ReactMarkdown>{narrative}</ReactMarkdown>
        </div>
      </div>
    );
  }

  // Dice present but no `---` separator — single fade-in after dice
  if (!hasPhases) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">
            Game Master
          </span>
        </div>
        <DiceRollDisplay rolls={diceRolls} onComplete={onDiceComplete} />
        <div
          className={`${narrativeBaseClass} transition-opacity duration-500 ${
            diceComplete ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
          }`}
        >
          <ReactMarkdown>{narrative}</ReactMarkdown>
        </div>
      </div>
    );
  }

  // Phased reveal: dice → part 1 fade-in → Continue button → part 2 fade-in
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">
          Game Master
        </span>
      </div>
      <DiceRollDisplay rolls={diceRolls} onComplete={onDiceComplete} />

      {/* Phase 1: atmospheric flavor text */}
      <div
        className={`${narrativeBaseClass} transition-opacity duration-500 ${
          diceComplete ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
        }`}
      >
        <ReactMarkdown>{part1}</ReactMarkdown>
      </div>

      {/* Continue button — visible after part 1 fades in, hidden once clicked */}
      {diceComplete && !revealed && (
        <div className="flex justify-center my-4">
          <button
            onClick={onReveal}
            className="px-6 py-2 rounded border border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 transition-colors cursor-pointer font-semibold tracking-wide text-sm"
          >
            Continue
          </button>
        </div>
      )}

      {/* Phase 2: scores, commentary, next question */}
      <div
        className={`${narrativeBaseClass} transition-opacity duration-500 ${
          revealed ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
        }`}
      >
        <ReactMarkdown>{part2}</ReactMarkdown>
      </div>
    </div>
  );
}
