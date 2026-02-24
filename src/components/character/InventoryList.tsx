"use client";

import { useState } from "react";
import type { EquipmentItem } from "@/lib/game/types";

interface InventoryListProps {
  items: (EquipmentItem | string)[];
  gold?: number;
  maxSlots?: number;
}

function normalize(item: EquipmentItem | string): EquipmentItem {
  if (typeof item === "string") return { name: item, type: "gear" };
  return item;
}

const TYPE_LABELS: Record<EquipmentItem["type"], string> = {
  weapon: "Weapon",
  armor: "Armor",
  shield: "Shield",
  gear: "Gear",
  ammunition: "Ammo",
};

function ItemRow({ item }: { item: EquipmentItem | string }) {
  const [open, setOpen] = useState(false);
  const eq = normalize(item);

  const hasDetails =
    eq.damage || eq.description || (eq.properties && eq.properties.length > 0) || eq.equipped !== undefined;

  return (
    <li className="bg-stone-900 rounded border border-stone-800 overflow-hidden">
      <button
        onClick={() => hasDetails && setOpen((o) => !o)}
        className={`w-full flex items-center gap-2 px-3 py-1.5 text-left ${hasDetails ? "cursor-pointer hover:bg-stone-800/60 transition-colors" : "cursor-default"}`}
      >
        <span className="text-stone-600 shrink-0">&#x25AA;</span>
        <span className="text-sm text-stone-300 flex-1 min-w-0">
          {eq.quantity && eq.quantity > 1 ? `${eq.quantity}× ` : ""}
          {eq.name}
        </span>
        {hasDetails && (
          <svg
            className={`w-3.5 h-3.5 text-stone-500 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {open && hasDetails && (
        <div className="px-3 pb-2.5 pt-1 border-t border-stone-800 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700">
              {TYPE_LABELS[eq.type]}
            </span>
            {eq.equipped && (
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-stone-800 text-[var(--color-gold-dim)] border border-stone-700">
                Equipped
              </span>
            )}
          </div>

          {eq.damage && (
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] uppercase tracking-wider text-stone-500 w-14 shrink-0">Damage</span>
              <span className="text-base font-bold font-mono text-[var(--color-gold)]">{eq.damage}</span>
            </div>
          )}

          {eq.properties && eq.properties.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-[10px] uppercase tracking-wider text-stone-500 w-14 shrink-0 mt-0.5">Props</span>
              <ul className="space-y-0.5">
                {eq.properties.map((p, i) => (
                  <li key={i} className="text-xs text-stone-400">
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {eq.description && (
            <div className="flex items-start gap-2">
              <span className="text-[10px] uppercase tracking-wider text-stone-500 w-14 shrink-0 mt-0.5">Info</span>
              <p className="text-xs text-stone-400 leading-relaxed">{eq.description}</p>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export function InventoryList({ items, gold, maxSlots }: InventoryListProps) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-stone-500 mb-2">Equipment</h3>
      {gold !== undefined && gold > 0 && (
        <div className="text-sm text-[var(--color-gold)] mb-2 font-mono">{gold} <span className="text-stone-500">gp</span></div>
      )}
      <ul className="space-y-1">
        {items.map((item, i) => (
          <ItemRow key={i} item={item} />
        ))}
      </ul>
      <p className="text-xs text-stone-600 mt-1">
        {maxSlots !== undefined
          ? `${items.length} of ${maxSlots} gear slots used`
          : `${items.length} gear slot${items.length !== 1 ? "s" : ""} used`}
      </p>
    </div>
  );
}
