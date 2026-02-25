"use client";

import { useState } from "react";
import type { JournalEntry } from "@/lib/game/types";

interface TravelersJournalProps {
  entries: JournalEntry[];
  onAddEntry: (entry: Omit<JournalEntry, "id" | "createdAt">) => void;
  onEditEntry: (id: string, entry: Omit<JournalEntry, "id" | "createdAt">) => void;
  onDeleteEntry: (id: string) => void;
}

const CATEGORY_STYLES: Record<JournalEntry["category"], { label: string; color: string }> = {
  location: { label: "Location", color: "text-blue-400 border-blue-800 bg-blue-900/20" },
  quest:    { label: "Quest",    color: "text-[var(--color-gold)] border-yellow-800 bg-yellow-900/20" },
  npc:      { label: "NPC",      color: "text-green-400 border-green-800 bg-green-900/20" },
  item:     { label: "Item",     color: "text-purple-400 border-purple-800 bg-purple-900/20" },
  note:     { label: "Note",     color: "text-stone-400 border-stone-600 bg-stone-800/40" },
};

interface FormState {
  title: string;
  body: string;
  category: JournalEntry["category"];
}

const EMPTY_FORM: FormState = { title: "", body: "", category: "note" };

export function TravelersJournal({ entries, onAddEntry, onEditEntry, onDeleteEntry }: TravelersJournalProps) {
  const [isOpen, setIsOpen] = useState(entries.length > 0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // "add" | entry id being edited
  const [formMode, setFormMode] = useState<"add" | string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function openAddForm() {
    setForm(EMPTY_FORM);
    setFormMode("add");
    setConfirmDeleteId(null);
  }

  function openEditForm(entry: JournalEntry) {
    setForm({ title: entry.title, body: entry.body, category: entry.category });
    setFormMode(entry.id);
    setExpandedId(entry.id);
    setConfirmDeleteId(null);
  }

  function closeForm() {
    setFormMode(null);
    setForm(EMPTY_FORM);
  }

  function handleSave() {
    const trimmed = { title: form.title.trim(), body: form.body.trim(), category: form.category };
    if (!trimmed.title || !trimmed.body) return;

    if (formMode === "add") {
      onAddEntry(trimmed);
      setIsOpen(true);
    } else if (formMode) {
      onEditEntry(formMode, trimmed);
    }
    closeForm();
  }

  function handleDelete(id: string) {
    onDeleteEntry(id);
    setConfirmDeleteId(null);
    if (expandedId === id) setExpandedId(null);
  }

  return (
    <div className="bg-stone-900 border border-stone-700 rounded-lg p-3">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center justify-between"
      >
        <h3 className="text-xs uppercase tracking-wider text-stone-500">
          Traveler&apos;s Journal
        </h3>
        <span className="flex items-center gap-2">
          {entries.length > 0 && (
            <span className="text-xs text-stone-500 font-mono">{entries.length}</span>
          )}
          <span className="text-stone-600 text-xs">{isOpen ? "▲" : "▼"}</span>
        </span>
      </button>

      {isOpen && (
        <div className="mt-2 space-y-1">
          {entries.length === 0 && formMode !== "add" && (
            <p className="text-stone-600 text-xs py-1">No entries yet.</p>
          )}

          {entries.map((entry) => {
            const style = CATEGORY_STYLES[entry.category];
            const isExpanded = expandedId === entry.id;
            const isEditing = formMode === entry.id;
            const isConfirmingDelete = confirmDeleteId === entry.id;

            return (
              <div key={entry.id} className="border border-stone-800 rounded">
                {/* Row header — always visible */}
                <button
                  onClick={() => {
                    if (!isEditing) setExpandedId(isExpanded ? null : entry.id);
                  }}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-left"
                >
                  <span className="text-stone-300 text-xs truncate flex-1 mr-2">
                    {entry.title}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${style.color}`}
                  >
                    {style.label}
                  </span>
                </button>

                {/* Expanded: either read view or edit form */}
                {isExpanded && (
                  <div className="border-t border-stone-800">
                    {isEditing ? (
                      <EntryForm
                        form={form}
                        onChange={setForm}
                        onSave={handleSave}
                        onCancel={closeForm}
                        saveLabel="Save changes"
                      />
                    ) : (
                      <div className="px-2 pb-2">
                        <p className="text-stone-400 text-xs mt-1.5 leading-relaxed">{entry.body}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-stone-600 text-[10px]">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </p>
                          {isConfirmingDelete ? (
                            <span className="flex items-center gap-2">
                              <span className="text-[10px] text-stone-500">Delete?</span>
                              <button
                                onClick={() => handleDelete(entry.id)}
                                className="text-[10px] text-red-400 hover:text-red-300 transition-colors"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-[10px] text-stone-500 hover:text-stone-300 transition-colors"
                              >
                                No
                              </button>
                            </span>
                          ) : (
                            <span className="flex items-center gap-3">
                              <button
                                onClick={() => openEditForm(entry)}
                                className="text-[10px] text-stone-500 hover:text-stone-300 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(entry.id)}
                                className="text-[10px] text-stone-600 hover:text-red-400 transition-colors"
                              >
                                Delete
                              </button>
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add entry form or button */}
          {formMode === "add" ? (
            <div className="border border-stone-700 rounded mt-2">
              <EntryForm
                form={form}
                onChange={setForm}
                onSave={handleSave}
                onCancel={closeForm}
                saveLabel="Save"
              />
            </div>
          ) : (
            <button
              onClick={openAddForm}
              className="w-full text-left text-xs text-stone-600 hover:text-stone-400 transition-colors pt-1"
            >
              + Add entry
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function EntryForm({
  form,
  onChange,
  onSave,
  onCancel,
  saveLabel,
}: {
  form: FormState;
  onChange: (f: FormState) => void;
  onSave: () => void;
  onCancel: () => void;
  saveLabel: string;
}) {
  const canSave = form.title.trim().length > 0 && form.body.trim().length > 0;
  return (
    <div className="p-2 space-y-2">
      <input
        type="text"
        placeholder="Title"
        value={form.title}
        onChange={(e) => onChange({ ...form, title: e.target.value })}
        className="w-full bg-stone-800 border border-stone-700 rounded px-2 py-1 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-stone-500"
      />
      <textarea
        placeholder="Notes..."
        value={form.body}
        onChange={(e) => onChange({ ...form, body: e.target.value })}
        rows={3}
        className="w-full bg-stone-800 border border-stone-700 rounded px-2 py-1 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-stone-500 resize-none"
      />
      <select
        value={form.category}
        onChange={(e) => onChange({ ...form, category: e.target.value as JournalEntry["category"] })}
        className="w-full bg-stone-800 border border-stone-700 rounded px-2 py-1 text-xs text-stone-300 focus:outline-none focus:border-stone-500"
      >
        <option value="note">Note</option>
        <option value="location">Location</option>
        <option value="npc">NPC</option>
        <option value="quest">Quest</option>
        <option value="item">Item</option>
      </select>
      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={!canSave}
          className="flex-1 bg-stone-700 hover:bg-stone-600 disabled:opacity-40 disabled:cursor-not-allowed text-stone-200 text-xs rounded py-1 transition-colors"
        >
          {saveLabel}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 text-stone-500 hover:text-stone-300 text-xs transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
