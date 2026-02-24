"use client";

interface SpellListProps {
  spells: string[];
}

export function SpellList({ spells }: SpellListProps) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-stone-500 mb-2">Spells</h3>
      <ul className="space-y-1">
        {spells.map((spell, i) => (
          <li
            key={i}
            className="text-sm text-stone-300 bg-stone-900 rounded px-3 py-1.5 border border-stone-800 flex items-center gap-2"
          >
            <span className="text-purple-400">&#x2726;</span>
            {spell}
          </li>
        ))}
      </ul>
    </div>
  );
}
