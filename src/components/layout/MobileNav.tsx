"use client";

interface MobileNavProps {
  activeTab: "left" | "center" | "right";
  onTabChange: (tab: "left" | "center" | "right") => void;
  leftLabel?: string;
  rightLabel?: string;
}

export function MobileNav({
  activeTab,
  onTabChange,
  leftLabel = "Character",
  rightLabel = "Tools",
}: MobileNavProps) {
  const tabs: { key: "left" | "center" | "right"; label: string }[] = [
    { key: "left", label: leftLabel },
    { key: "center", label: "Adventure" },
    { key: "right", label: rightLabel },
  ];

  return (
    <nav className="flex border-t border-stone-800 bg-stone-950">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`flex-1 py-3 text-xs uppercase tracking-wider font-semibold transition-colors ${
            activeTab === tab.key
              ? "text-[var(--color-gold)] border-t-2 border-[var(--color-gold)]"
              : "text-stone-500 hover:text-stone-300"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
