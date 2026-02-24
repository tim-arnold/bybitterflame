"use client";

import { useState } from "react";
import { MobileNav } from "./MobileNav";

interface GameLayoutProps {
  leftPanel: React.ReactNode;
  centerPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  leftTitle?: string;
  rightTitle?: string;
}

export function GameLayout({
  leftPanel,
  centerPanel,
  rightPanel,
  leftTitle = "Character",
  rightTitle = "Tools",
}: GameLayoutProps) {
  const [mobileTab, setMobileTab] = useState<"left" | "center" | "right">("center");

  return (
    <div className="h-screen flex flex-col bg-stone-950">
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
