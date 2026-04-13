import type { Metadata } from "next";
import { HowToPlayContent } from "@/components/HowToPlayContent";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "How to Play",
  description:
    "Learn how to play By Bitter Flame — an AI-powered Fantasy Adventure. Create a character and explore a fading world by torchlight.",
};

export default function HowToPlayPage() {
  return (
    <main className="relative min-h-screen">
      <div className="fixed inset-0 bg-[url('/bg-woodcut.webp')] bg-cover bg-center" />

      <div className="animate-content-in relative z-10 mx-auto max-w-4xl px-4 py-12">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-uncial mb-1 text-4xl tracking-tight text-[var(--color-gold)]">
              How to Play
            </h1>
            <a href="/" className="text-sm text-stone-400 hover:text-stone-300 transition-colors">
              ← Back to Home
            </a>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-stone-800 bg-stone-950/90 p-6">
          <HowToPlayContent />
        </div>
        <SiteFooter />
      </div>
    </main>
  );
}
