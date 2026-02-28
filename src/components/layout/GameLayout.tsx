"use client";

import { useState } from "react";
import { MobileNav } from "./MobileNav";
import { UserNav } from "@/components/UserNav";
import { HowToPlayModal } from "@/components/HowToPlayModal";

interface GameLayoutProps {
  leftPanel: React.ReactNode;
  centerPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  leftTitle?: string;
  rightTitle?: string;
  title?: string;
  isSaved?: boolean;
}

export function GameLayout({
  leftPanel,
  centerPanel,
  rightPanel,
  leftTitle = "Character",
  rightTitle = "Tools",
  title,
  isSaved = true,
}: GameLayoutProps) {
  const [mobileTab, setMobileTab] = useState<"left" | "center" | "right">("center");
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const tooltip = isSaved
    ? "Your session is saved — safe to leave."
    : "The GM is responding. Wait a moment before leaving.";

  return (
    <div className="h-screen flex flex-col bg-stone-950">
      {/* Title bar */}
      {title && (
        <div className="shrink-0 border-b border-stone-800 bg-stone-950 px-4 py-2 grid grid-cols-3 items-center">
          {/* Left: save indicator */}
          <div className="flex items-center gap-2">
            <div className="relative group">
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-stone-600 text-[10px] text-stone-500 cursor-default select-none group-hover:border-stone-400 group-hover:text-stone-300 transition-colors">
                i
              </span>
              <div className="pointer-events-none absolute left-0 top-6 z-50 w-56 rounded border border-stone-700 bg-stone-900 px-3 py-2 text-xs text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                <span className={`mr-1.5 ${isSaved ? "text-emerald-400" : "text-yellow-400"}`}>
                  {isSaved ? "●" : "○"}
                </span>
                {tooltip}
              </div>
            </div>
          </div>

          {/* Center: campaign title */}
          <span className="text-sm font-semibold text-[var(--color-gold)] tracking-wide text-center">
            {title}
          </span>

          {/* Right: user nav */}
          <div className="flex justify-end">
            <UserNav onHowToPlay={() => setShowHowToPlay(true)} />
          </div>
        </div>
      )}

      {/* Desktop layout */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <aside className="w-72 border-r border-stone-800 overflow-y-auto">
          {leftPanel}
        </aside>
        <main className="flex-1 flex flex-col overflow-hidden">
          {centerPanel}
        </main>
        <aside className="w-72 border-l border-stone-800 overflow-y-auto p-4 space-y-4">
          {rightPanel}
        </aside>
      </div>

      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}

      {/* Mobile layout */}
      <div className="md:hidden flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {mobileTab === "left" && <div className="h-full overflow-y-auto">{leftPanel}</div>}
          {mobileTab === "center" && <div className="h-full flex flex-col">{centerPanel}</div>}
          {mobileTab === "right" && <div className="h-full overflow-y-auto p-4 space-y-4">{rightPanel}</div>}
        </div>
        <MobileNav
          activeTab={mobileTab}
          onTabChange={setMobileTab}
          leftLabel={leftTitle}
          rightLabel={rightTitle}
        />
      </div>
    </div>
  );
}
