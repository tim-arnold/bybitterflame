"use client";

import { useState } from "react";
import type { EquipmentItem } from "@/lib/game/types";
import { enrichEquipment } from "@/lib/game/equipment-lookup";

interface InventoryListProps {
  items: (EquipmentItem | string)[];
  gold?: number;
  silver?: number;
  copper?: number;
  maxSlots?: number;
}

function normalize(item: EquipmentItem | string): EquipmentItem {
  const base: EquipmentItem = typeof item === "string" ? { name: item, type: "gear" } : item;
  return enrichEquipment(base);
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
        {eq.slots !== undefined && eq.slots !== 1 && (
          <span className="text-[10px] text-stone-600 shrink-0">
            {eq.slots === 0 ? "worn" : `${eq.slots} slots`}
          </span>
        )}
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

export function InventoryList({ items, gold, silver, copper, maxSlots }: InventoryListProps) {
  const normalized = items.map(normalize);

  const weapons = normalized.filter((i) => i.type === "weapon" && (i.slots ?? 1) > 0);
  const gear = normalized.filter((i) => i.type !== "weapon" && (i.slots ?? 1) > 0);
  const worn = normalized.filter((i) => i.slots === 0);

  const slotsUsed = normalized
    .filter((i) => (i.slots ?? 1) > 0)
    .reduce((sum, i) => sum + (i.slots ?? 1), 0);

  const slotLabel = maxSlots !== undefined
    ? `${slotsUsed} of ${maxSlots} gear slots used`
    : `${slotsUsed} gear slot${slotsUsed !== 1 ? "s" : ""} used`;

  const overEncumbered = maxSlots !== undefined && slotsUsed > maxSlots;

  return (
    <div className="space-y-4">
      {(gold !== undefined || silver !== undefined || copper !== undefined) && (
        <div className="flex gap-3 font-mono text-sm">
          {gold !== undefined && gold > 0 && (
            <span><span className="text-[var(--color-gold)]">{gold}</span> <span className="text-stone-500">gp</span></span>
          )}
          {silver !== undefined && silver > 0 && (
            <span><span className="text-stone-300">{silver}</span> <span className="text-stone-500">sp</span></span>
          )}
          {copper !== undefined && copper > 0 && (
            <span><span className="text-orange-400">{copper}</span> <span className="text-stone-500">cp</span></span>
          )}
        </div>
      )}

      {weapons.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-stone-500 mb-2">Weapons</h3>
          <ul className="space-y-1">
            {weapons.map((item, i) => (
              <ItemRow key={i} item={item} />
            ))}
          </ul>
        </div>
      )}

      {gear.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-stone-500 mb-2">Gear</h3>
          <ul className="space-y-1">
            {gear.map((item, i) => (
              <ItemRow key={i} item={item} />
            ))}
          </ul>
        </div>
      )}

      {worn.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-stone-500 mb-2">Worn / No Slots</h3>
          <ul className="space-y-1">
            {worn.map((item, i) => (
              <ItemRow key={i} item={item} />
            ))}
          </ul>
        </div>
      )}

      <p className={`text-xs ${overEncumbered ? "text-red-500" : "text-stone-600"}`}>
        {slotLabel}
        {overEncumbered && " — over encumbered!"}
      </p>
    </div>
  );
}