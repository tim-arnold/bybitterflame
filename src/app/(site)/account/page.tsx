"use client";

import Link from "next/link";
import { SettingsContent } from "@/components/SettingsContent";

export default function AccountPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="absolute inset-0 bg-[url('/dungeon-background.webp')] bg-cover bg-center" />


      <div className="relative z-10 w-full max-w-sm px-4">
        <div className="mb-6">
          <Link
            href="/"
            className="text-xs text-stone-400 hover:text-white transition-colors"
          >
            ← Back
          </Link>
        </div>

        <h1 className="mb-1 text-center text-3xl font-bold tracking-tight text-[var(--color-gold)]">
          By Torchlight
        </h1>
        <p className="mb-8 text-center text-sm text-stone-400">Account Settings</p>

        <div className="rounded-lg border border-stone-800 bg-stone-950/90 p-6">
          <SettingsContent />
        </div>
      </div>
    </div>
  );
}
