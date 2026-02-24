"use client";

import { useEffect, useState, useRef } from "react";

interface DiceRoll {
  name?: string;
  notation: string;
  rolls: number[];
  total: number;
}

interface DiceRollDisplayProps {
  rolls: DiceRoll[];
  onComplete?: () => void;
}

/** Unicode dice faces for d6 */
const D6_FACES = ["\u2680", "\u2681", "\u2682", "\u2683", "\u2684", "\u2685"];

function DieFace({ value, sides, delay }: { value: number; sides: number; delay: number }) {
  const [phase, setPhase] = useState<"waiting" | "tumbling" | "revealed">("waiting");
  const [displayValue, setDisplayValue] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    // Start tumbling after delay
    const startTimer = setTimeout(() => {
      setPhase("tumbling");

      // Cycle through random values rapidly
      intervalRef.current = setInterval(() => {
        setDisplayValue(Math.ceil(Math.random() * sides));
      }, 60);

      // Stop tumbling and reveal after 600ms of rolling
      setTimeout(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayValue(value);
        setPhase("revealed");
      }, 600);
    }, delay);

    return () => {
      clearTimeout(startTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [value, sides, delay]);

  const isD6 = sides === 6;

  if (phase === "waiting") {
    return (
      <span className="inline-flex items-center justify-center w-14 h-14 text-4xl leading-none rounded-md text-stone-600 bg-stone-800/50">
        {isD6 ? <span className="opacity-30">{D6_FACES[0]}</span> : <span className="text-xl font-bold opacity-50">?</span>}
      </span>
    );
  }

  if (phase === "tumbling") {
    return (
      <span className="inline-flex items-center justify-center w-14 h-14 text-4xl leading-none rounded-md bg-stone-800 animate-dice-tumble text-stone-300">
        {isD6 ? D6_FACES[displayValue - 1] : <span className="text-xl font-bold">{displayValue}</span>}
      </span>
    );
  }

  // revealed
  return (
    <span className="inline-flex items-center justify-center w-14 h-14 text-4xl leading-none rounded-md bg-stone-900 transition-all duration-300 scale-110 animate-dice-land text-[var(--color-gold)]">
      {isD6 ? D6_FACES[value - 1] : <span className="text-xl font-bold">{value}</span>}
    </span>
  );
}

function SingleRollDisplay({ roll, baseDelay }: { roll: DiceRoll; baseDelay: number }) {
  const [showTotal, setShowTotal] = useState(false);
  const sides = parseInt(roll.notation.match(/d(\d+)/)?.[1] ?? "6", 10);
  // Each die starts 300ms after the previous, plus 600ms tumble time, plus a beat
  const totalDelay = baseDelay + roll.rolls.length * 300 + 600 + 200;

  useEffect(() => {
    const timer = setTimeout(() => setShowTotal(true), totalDelay);
    return () => clearTimeout(timer);
  }, [totalDelay]);

  return (
    <div className="flex items-baseline gap-2.5 py-1.5">
      {roll.name && (
        <span className="text-base font-medium text-stone-400 w-28 text-right shrink-0">
          {roll.name}
        </span>
      )}
      <div className="flex items-center gap-1.5">
        {roll.rolls.map((value, i) => (
          <DieFace key={i} value={value} sides={sides} delay={baseDelay + i * 300} />
        ))}
      </div>
      <span
        className={`text-base font-bold ml-1 transition-all duration-500 ${
          showTotal
            ? "text-[var(--color-gold)] opacity-100 translate-x-0"
            : "opacity-0 -translate-x-2"
        }`}
      >
        = {roll.total}
      </span>
    </div>
  );
}

/** Calculate the total duration of all dice animations */
export function getTotalAnimationDuration(rolls: DiceRoll[]): number {
  let cumulative = 0;
  for (let i = 0; i < rolls.length; i++) {
    cumulative += rolls[i].rolls.length * 300 + 600 + 200;
  }
  // Add a small buffer after the last total fades in
  return cumulative + 500;
}

export function DiceRollDisplay({ rolls, onComplete }: DiceRollDisplayProps) {
  // Stagger each row: previous row's dice count * 300ms per die + 600ms tumble + 400ms gap
  const rowDelays: number[] = [];
  let cumulative = 0;
  for (let i = 0; i < rolls.length; i++) {
    rowDelays.push(cumulative);
    cumulative += rolls[i].rolls.length * 300 + 600 + 200;
  }

  useEffect(() => {
    if (!onComplete) return;
    const timer = setTimeout(onComplete, cumulative + 500);
    return () => clearTimeout(timer);
  }, [onComplete, cumulative]);

  return (
    <div className="my-3 bg-stone-900/80 border border-stone-700 rounded-lg px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] uppercase tracking-widest text-stone-500">Rolling dice</span>
      </div>
      <div className="space-y-0.5">
        {rolls.map((roll, i) => (
          <SingleRollDisplay key={i} roll={roll} baseDelay={rowDelays[i]} />
        ))}
      </div>
    </div>
  );
}
