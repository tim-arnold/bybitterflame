"use client";

import Link from "next/link";
import { UserNav } from "@/components/UserNav";

export function SiteNav() {
  return (
    <div className="fixed top-0 inset-x-0 z-30 h-12 flex items-center justify-between px-4 border-b border-stone-800 bg-stone-950/90 backdrop-blur-sm">
      <Link
        href="/"
        className="text-sm font-semibold text-[var(--color-gold)] hover:text-white transition-colors"
      >
        By Torchlight
      </Link>
      <UserNav />
    </div>
  );
}
