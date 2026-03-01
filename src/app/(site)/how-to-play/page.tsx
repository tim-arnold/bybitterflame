import type { Metadata } from "next";
import Link from "next/link";
import { HowToPlayContent } from "@/components/HowToPlayContent";

export const metadata: Metadata = {
  title: "How to Play",
  description:
    "Learn how to play By Torchlight — the AI-powered Game Master for Shadowdark RPG. Create a character, explore dungeons, and survive by torchlight.",
};

export default function HowToPlayPage() {
  return (
    <main className="relative min-h-screen">
      <div className="fixed inset-0 bg-[url('/dungeon-background.webp')] bg-cover bg-center" />


      <div className="relative z-10 mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--color-gold)]">
              How to Play
            </h1>
            <p className="mt-1 text-sm text-stone-400">By Torchlight — AI Game Master</p>
          </div>
          <Link
            href="/"
            className="text-sm text-stone-400 hover:text-white transition-colors"
          >
            ← Home
          </Link>
        </div>

        <div className="rounded-lg border border-stone-800 bg-stone-950/90 p-6">
          <HowToPlayContent />
        </div>
      </div>
    </main>
  );
}
