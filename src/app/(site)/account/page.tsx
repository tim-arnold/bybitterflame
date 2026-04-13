"use client";

import { SettingsContent } from "@/components/SettingsContent";
import { SiteFooter } from "@/components/SiteFooter";

export default function AccountPage() {
  return (
    <main className="relative min-h-screen">
      <div className="fixed inset-0 bg-[url('/bg-woodcut.webp')] bg-cover bg-center" />

      <div className="animate-content-in relative z-10 mx-auto max-w-4xl px-4 py-12">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-uncial mb-1 text-4xl tracking-tight text-[var(--color-gold)]">
              Account Settings
            </h1>
            <a href="/" className="text-sm text-stone-400 hover:text-stone-300 transition-colors">
              ← Back to Home
            </a>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-stone-800 bg-stone-950/90 p-6">
          <SettingsContent />
        </div>
        <SiteFooter />
      </div>
    </main>
  );
}
