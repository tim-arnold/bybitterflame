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
  afterWeapons?: React.ReactNode;
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
        aria-expanded={hasDetails ? open : undefined}
        className={`w-full flex items-center gap-2 px-3 py-1.5 text-left ${hasDetails ? "cursor-pointer hover:bg-stone-800/60 transition-colors" : "cursor-default"}`}
      >
        <span aria-hidden="true" className="text-stone-600 shrink-0">&#x25AA;</span>
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
            aria-hidden="true"
            className={`w-3.5 h-3.5 text-stone-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
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
              <span className="text-[10px] uppercase tracking-wider text-stone-400 w-14 shrink-0">Damage</span>
              <span className="text-base font-bold font-mono text-[var(--color-gold)]">{eq.damage}</span>
            </div>
          )}

          {eq.properties && eq.properties.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-[10px] uppercase tracking-wider text-stone-400 w-14 shrink-0 mt-0.5">Props</span>
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
              <span className="text-[10px] uppercase tracking-wider text-stone-400 w-14 shrink-0 mt-0.5">Info</span>
              <p className="text-xs text-stone-400 leading-relaxed">{eq.description}</p>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export function InventoryList({ items, gold, silver, copper, maxSlots, afterWeapons }: InventoryListProps) {
  const normalized = items.map(normalize);

  const isCombatGear = (i: EquipmentItem) => i.type === "weapon" || i.type === "armor" || i.type === "shield";
  const combatGear = normalized.filter(isCombatGear);
  const gear = normalized.filter((i) => !isCombatGear(i) && (i.slots ?? 1) > 0);
  const worn = normalized.filter((i) => !isCombatGear(i) && (i.slots ?? 1) === 0);

  const totalCoins = (gold ?? 0) + (silver ?? 0) + (copper ?? 0);
  const coinSlots = Math.max(0, Math.floor((totalCoins - 100) / 100));
  const slotsUsed = normalized
    .filter((i) => (i.slots ?? 1) > 0)
    .reduce((sum, i) => sum + (i.slots ?? 1), 0) + coinSlots;


  const slotLabel = maxSlots !== undefined
    ? `${slotsUsed} of ${maxSlots} gear slots used`
    : `${slotsUsed} gear slot${slotsUsed !== 1 ? "s" : ""} used`;

  const overEncumbered = maxSlots !== undefined && slotsUsed > maxSlots;

  return (
    <div className="space-y-4">
      {(gold !== undefined || silver !== undefined || copper !== undefined) && (
        <div className="flex items-center gap-3 font-mono text-sm">
          <span><span className="text-[var(--color-gold)]">{gold ?? 0}</span> <span className="text-stone-400">gp</span></span>
          <span><span className="text-stone-300">{silver ?? 0}</span> <span className="text-stone-400">sp</span></span>
          <span><span className="text-orange-400">{copper ?? 0}</span> <span className="text-stone-400">cp</span></span>
          <div className="relative group">
            <button
              type="button"
              aria-label="Currency info"
              aria-describedby="coin-info-tooltip"
              className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-stone-600 text-[9px] text-stone-400 cursor-default select-none group-hover:border-stone-400 group-hover:text-stone-300 focus:border-stone-400 focus:text-stone-300 focus:outline-none transition-colors"
            >
              i
            </button>
            <div
              id="coin-info-tooltip"
              role="tooltip"
              className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-5 z-50 w-48 rounded border border-stone-700 bg-stone-900 px-2.5 py-2 text-xs text-stone-300 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity shadow-lg font-sans space-y-1"
            >
              <p><span className="text-[var(--color-gold)]">gp</span> — gold piece</p>
              <p><span className="text-stone-300">sp</span> — silver piece</p>
              <p><span className="text-orange-400">cp</span> — copper piece</p>
              <p className="border-t border-stone-700 pt-1 text-stone-400">10 cp = 1 sp · 10 sp = 1 gp</p>
              <p className="text-stone-400">First 100 coins free; then 1 slot per 100</p>
            </div>
          </div>
        </div>
      )}

      {combatGear.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-stone-400 mb-2">Weapons &amp; Armor</h3>
          <ul className="space-y-1">
            {combatGear.map((item, i) => (
              <ItemRow key={i} item={item} />
            ))}
          </ul>
        </div>
      )}

      {afterWeapons}

      {gear.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-stone-400 mb-2">Gear</h3>
          <ul className="space-y-1">
            {gear.map((item, i) => (
              <ItemRow key={i} item={item} />
            ))}
          </ul>
        </div>
      )}

      {worn.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-stone-400 mb-2">Worn / No Slots</h3>
          <ul className="space-y-1">
            {worn.map((item, i) => (
              <ItemRow key={i} item={item} />
            ))}
          </ul>
        </div>
      )}

      <p className={`text-xs ${overEncumbered ? "text-red-500" : "text-stone-400"}`}>
        {slotLabel}
        {overEncumbered && " — over encumbered!"}
      </p>
    </div>
  );
}