"use client";

import { useState } from "react";
import type { Campaign, JournalEntry } from "@/lib/game/types";

export interface JournalReturn {
  journalEntries: JournalEntry[];
  setInitialEntries: (entries: JournalEntry[]) => void;
  /** Apply a journal entry received from the GM during a gamestate update. Returns the new entry. */
  applyJournalEntry: (entry: JournalEntry) => void;
  handleAddJournalEntry: (entryData: Omit<JournalEntry, "id" | "createdAt">) => void;
  handleEditJournalEntry: (id: string, entryData: Omit<JournalEntry, "id" | "createdAt">) => void;
  handleDeleteJournalEntry: (id: string) => void;
}

/** Manages journal entries and keeps them in sync with campaign.worldState. */
export function useJournal(
  setCampaign: React.Dispatch<React.SetStateAction<Partial<Campaign>>>
): JournalReturn {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  function setInitialEntries(entries: JournalEntry[]) {
    setJournalEntries(entries);
  }

  function applyJournalEntry(entry: JournalEntry) {
    setJournalEntries((prev) => [entry, ...prev]);
  }

  function handleAddJournalEntry(entryData: Omit<JournalEntry, "id" | "createdAt">) {
    const entry: JournalEntry = {
      ...entryData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setJournalEntries((prev) => [entry, ...prev]);
    setCampaign((prev) => ({
      ...prev,
      worldState: {
        ...prev.worldState,
        journalEntries: [entry, ...(prev.worldState?.journalEntries ?? [])],
      } as typeof prev.worldState,
    }));
  }

  function handleEditJournalEntry(id: string, entryData: Omit<JournalEntry, "id" | "createdAt">) {
    setJournalEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...entryData } : e)));
    setCampaign((prev) => ({
      ...prev,
      worldState: {
        ...prev.worldState,
        journalEntries: (prev.worldState?.journalEntries ?? []).map((e) =>
          e.id === id ? { ...e, ...entryData } : e
        ),
      } as typeof prev.worldState,
    }));
  }

  function handleDeleteJournalEntry(id: string) {
    setJournalEntries((prev) => prev.filter((e) => e.id !== id));
    setCampaign((prev) => ({
      ...prev,
      worldState: {
        ...prev.worldState,
        journalEntries: (prev.worldState?.journalEntries ?? []).filter((e) => e.id !== id),
      } as typeof prev.worldState,
    }));
  }

  return {
    journalEntries,
    setInitialEntries,
    applyJournalEntry,
    handleAddJournalEntry,
    handleEditJournalEntry,
    handleDeleteJournalEntry,
  };
}
