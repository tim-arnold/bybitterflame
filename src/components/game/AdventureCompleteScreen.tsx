"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface AdventureCompleteScreenProps {
  summary: string;
  characterName: string;
}

export function AdventureCompleteScreen({ summary, characterName }: AdventureCompleteScreenProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Background image */}
      <div className="fixed inset-0">
        <Image src="/dungeon-background.webp" alt="" fill className="object-cover" priority />
      </div>
      {/* Dark overlay */}


      {/* Content */}
      <div className="relative z-10 px-4 py-12">
        <div className="w-full max-w-lg mx-auto space-y-6">

          {/* Header */}
          <div className="text-center space-y-2">
            <p className="text-xs uppercase tracking-widest text-stone-500">The adventure concludes</p>
            <h1 className="text-3xl font-bold text-[var(--color-gold)] tracking-widest uppercase">
              Victory
            </h1>
          </div>

          {/* GM summary narrative */}
          <div className="bg-stone-950/70 border border-stone-700/50 rounded-lg px-5 py-4">
            <p className="text-stone-300 text-sm leading-relaxed italic whitespace-pre-wrap">
              {summary}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-stone-700/50" />

          {/* Roster save notice */}
          <p className="text-center text-stone-400 text-sm">
            <span className="text-stone-200 font-medium">{characterName}</span> has been saved to your roster.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push("/adventures")}
              className="flex-1 bg-stone-900 hover:bg-stone-800 border border-[var(--color-gold)]/60 text-[var(--color-gold)] text-sm font-medium px-4 py-3 rounded-lg transition-colors"
            >
              Begin New Adventure
            </button>
            <button
              onClick={() => router.push("/")}
              className="flex-1 bg-stone-900 hover:bg-stone-800 border border-stone-600 text-stone-100 text-sm px-4 py-3 rounded-lg transition-colors"
            >
              Return to Home
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
