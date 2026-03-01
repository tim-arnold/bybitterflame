"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  userId: string;
  userName: string;
}

export function DeleteUserButton({ userId, userName }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setBusy(true);
    try {
      await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-stone-400">Delete {userName}?</span>
        <button
          onClick={handleDelete}
          disabled={busy}
          className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
        >
          {busy ? "…" : "Yes"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={busy}
          className="text-xs text-stone-500 hover:text-stone-300 disabled:opacity-50 transition-colors"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs text-stone-600 hover:text-red-400 transition-colors"
    >
      Delete
    </button>
  );
}
