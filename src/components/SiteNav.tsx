"use client";

import Link from "next/link";
import { UserNav } from "@/components/UserNav";

function FlameIcon() {
  return (
    <svg width="10" height="13" viewBox="0 0 10 13" fill="currentColor" aria-hidden>
      <path d="M5 0C5 0 0 5 0 8.5a5 5 0 0 0 10 0C10 5 5 0 5 0z" />
    </svg>
  );
}

export function SiteNav() {
  return (
    <div className="fixed top-0 inset-x-0 z-30 h-12 flex items-center justify-between px-4 border-b border-stone-800 bg-stone-950/90 backdrop-blur-sm">
      <Link
        href="/"
        className="flex items-center gap-2 text-sm font-semibold text-[var(--color-gold)] hover:text-white transition-colors"
      >
        <FlameIcon />
        By Torchlight
      </Link>
      <UserNav />
    </div>
  );
}
