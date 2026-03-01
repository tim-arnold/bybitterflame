"use client";

import { SettingsContent } from "@/components/SettingsContent";

export default function AccountPage() {
  return (
    <main className="relative min-h-screen">
      <div className="fixed inset-0 bg-[url('/dungeon-background-rattail.webp')] bg-cover bg-center" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-1 text-3xl font-bold tracking-tight text-[var(--color-gold)]">
          Account Settings
        </h1>
        <a href="/" className="text-sm text-stone-400 hover:text-stone-300 transition-colors">
          ← Back to Home
        </a>

        <div className="mt-8 rounded-lg border border-stone-800 bg-stone-950/90 p-6">
          <SettingsContent />
        </div>
      </div>
    </main>
  );
}
