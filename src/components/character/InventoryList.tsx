"use client";

interface InventoryListProps {
  items: string[];
  gold?: number;
}

export function InventoryList({ items, gold }: InventoryListProps) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-stone-500 mb-2">Equipment</h3>
      {gold !== undefined && gold > 0 && (
        <div className="text-sm text-[var(--color-gold)] mb-2 font-mono">{gold} gp</div>
      )}
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li
            key={i}
            className="text-sm text-stone-300 bg-stone-900 rounded px-3 py-1.5 border border-stone-800 flex items-center gap-2"
          >
            <span className="text-stone-600">&#x25AA;</span>
            {item}
          </li>
        ))}
      </ul>
      <p className="text-xs text-stone-600 mt-1">{items.length} gear slot{items.length !== 1 ? "s" : ""} used</p>
    </div>
  );
}
