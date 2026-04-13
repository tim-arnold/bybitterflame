"use client";

import { useState } from "react";
import type { Quest } from "@/lib/game/types";

interface QuestLogProps {
  quests: Quest[];
}

export function QuestLog({ quests }: QuestLogProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [expandedName, setExpandedName] = useState<string | null>(null);

  const active = quests.filter((q) => q.status === "active");
  const resolved = quests.filter((q) => q.status !== "active");

  if (quests.length === 0) return null;

  return (
    <div className="bg-stone-900 border border-stone-700 rounded-lg p-3">
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        aria-controls="quest-log-entries"
        className="w-full flex items-center justify-between cursor-pointer"
      >
        <h3 className="text-xs uppercase tracking-wider text-stone-400">
          Quest Log
        </h3>
        <span className="flex items-center gap-2">
          {active.length > 0 && (
            <span
              className="text-xs text-[var(--color-gold)] font-mono"
              aria-label={`${active.length} active quest${active.length !== 1 ? "s" : ""}`}
            >
              {active.length}
            </span>
          )}
          <span aria-hidden="true" className="text-stone-600 text-xs">
            {isOpen ? "▲" : "▼"}
          </span>
        </span>
      </button>

      {isOpen && (
        <div id="quest-log-entries" className="mt-2 space-y-1">
          {active.length === 0 && (
            <p className="text-stone-600 text-xs py-1">No active quests.</p>
          )}

          {active.map((quest) => (
            <QuestCard
              key={quest.name}
              quest={quest}
              isExpanded={expandedName === quest.name}
              onToggle={() =>
                setExpandedName(expandedName === quest.name ? null : quest.name)
              }
            />
          ))}

          {resolved.length > 0 && (
            <div className="pt-1">
              <button
                onClick={() => setShowCompleted((v) => !v)}
                className="text-[10px] text-stone-600 hover:text-stone-400 transition-colors w-full text-left cursor-pointer"
              >
                {showCompleted ? "▲" : "▼"} {resolved.length} completed / failed
              </button>

              {showCompleted && (
                <div className="mt-1 space-y-1 opacity-60">
                  {resolved.map((quest) => (
                    <QuestCard
                      key={quest.name}
                      quest={quest}
                      isExpanded={expandedName === quest.name}
                      onToggle={() =>
                        setExpandedName(
                          expandedName === quest.name ? null : quest.name,
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QuestCard({
  quest,
  isExpanded,
  onToggle,
}: {
  quest: Quest;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const statusStyle =
    quest.status === "active"
      ? "text-[var(--color-gold)] border-yellow-800 bg-yellow-900/20"
      : quest.status === "completed"
        ? "text-green-400 border-green-900 bg-green-900/10"
        : "text-stone-500 border-stone-700 bg-stone-800/20";

  const statusLabel =
    quest.status === "active"
      ? "Active"
      : quest.status === "completed"
        ? "Done"
        : "Failed";

  return (
    <div className="border border-stone-800 rounded">
      <button
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="w-full flex items-center justify-between px-2 py-1.5 text-left gap-2 cursor-pointer"
      >
        <span className="flex flex-col flex-1 min-w-0">
          <span className="text-stone-300 text-xs truncate">{quest.name}</span>
          {quest.giver && (
            <span className="text-[10px] text-stone-500 truncate">from {quest.giver}</span>
          )}
        </span>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${statusStyle}`}
        >
          {statusLabel}
        </span>
      </button>

      {isExpanded && (
        <div className="border-t border-stone-800 px-2 pb-2">
          <p className="text-stone-400 text-xs mt-1.5 leading-relaxed">
            {quest.description}
          </p>

          {quest.objectives && quest.objectives.length > 0 && (
            <ul className="mt-2 space-y-1">
              {quest.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs">
                  <span
                    className={`mt-0.5 shrink-0 ${quest.status === "completed" ? "text-green-500" : "text-stone-600"}`}
                  >
                    {quest.status === "completed" ? "✓" : "◦"}
                  </span>
                  <span
                    className={
                      quest.status === "completed"
                        ? "text-stone-500 line-through"
                        : "text-stone-400"
                    }
                  >
                    {obj}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {(quest.giver || quest.reward) && (
            <div className="mt-2 space-y-0.5">
              {quest.giver && (
                <p className="text-[10px] text-stone-500">
                  From: {quest.giver}
                </p>
              )}
              {quest.reward && (
                <p className="text-[10px] text-[var(--color-gold)]/70">
                  Reward: {quest.reward}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
