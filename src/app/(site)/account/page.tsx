"use client";

import { SettingsContent } from "@/components/SettingsContent";

export default function AccountPage() {
  return (
    <main className="relative min-h-screen">
      <div className="fixed inset-0 bg-[url('/dungeon-background.webp')] bg-cover bg-center" />

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-gold)]">
            Account Settings
          </h1>
          <p className="mt-1 text-sm text-stone-400">By Torchlight — AI Game Master</p>
        </div>

        <div className="rounded-lg border border-stone-800 bg-stone-950/90 p-6">
          <SettingsContent />
        </div>
      </div>
    </main>
  );
}
