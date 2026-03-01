"use client";

import { useRef, useEffect, useState } from "react";
import { MobileNav } from "./MobileNav";
import { UserNav } from "@/components/UserNav";
import { HowToPlayModal } from "@/components/HowToPlayModal";
import { SettingsModal } from "@/components/SettingsModal";
import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface GameLayoutProps {
  leftPanel: React.ReactNode;
  centerPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  leftTitle?: string;
  rightTitle?: string;
  title?: string;
  isSaved?: boolean;
}

function MobileMenu({ onHowToPlay, onSettings }: { onHowToPlay: () => void; onSettings: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleSignOut() {
    setOpen(false);
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-7 items-center justify-center rounded border border-stone-700 text-stone-400 hover:border-stone-500 hover:text-white transition-colors cursor-pointer"
        aria-label="Menu"
      >
        <svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor">
          <rect width="14" height="1.5" rx="0.75" />
          <rect y="5.25" width="14" height="1.5" rx="0.75" />
          <rect y="10.5" width="14" height="1.5" rx="0.75" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 min-w-[140px] rounded border border-stone-700 bg-stone-900 py-1 shadow-xl">
          <button
            onClick={() => { setOpen(false); onHowToPlay(); }}
            className="w-full px-4 py-2 text-left text-sm text-stone-300 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer"
          >
            How to Play
          </button>
          {session && (
            <>
              <button
                onClick={() => { setOpen(false); onSettings(); }}
                className="w-full px-4 py-2 text-left text-sm text-stone-300 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer"
              >
                Settings
              </button>
              <div className="my-1 border-t border-stone-800" />
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-left text-sm text-stone-300 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </>
          )}
          {!session && (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-stone-300 hover:bg-stone-800 hover:text-white transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export function GameLayout({
  leftPanel,
  centerPanel,
  rightPanel,
  leftTitle = "Character",
  rightTitle = "Tools",
  title,
  isSaved = true,
}: GameLayoutProps) {
  const [mobileTab, setMobileTab] = useState<"left" | "center" | "right">("center");
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Lock body scroll for the duration of the game — the layout owns the full viewport.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // On iOS Safari the keyboard overlays the page and dvh doesn't shrink.
  // Track visualViewport.height and apply it directly so the layout
  // snaps up to sit flush against the keyboard.
  const layoutRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    function update() {
      if (!layoutRef.current) return;
      // The container fills the full layout viewport (fixed inset-0) so there's
      // never a gap behind the keyboard. We add padding-bottom equal to the
      // keyboard height so flex children fill only the visible area above it.
      const keyboardHeight = Math.max(0, window.innerHeight - vv!.height);
      layoutRef.current.style.paddingBottom = `${keyboardHeight}px`;
    }
    update();
    vv.addEventListener("resize", update);
    return () => {
      vv.removeEventListener("resize", update);
    };
  }, []);

  const tooltip = isSaved
    ? "Your session is saved — safe to leave."
    : "The GM is responding. Wait a moment before leaving.";

  return (
    <div ref={layoutRef} className="fixed inset-0 overflow-hidden flex flex-col bg-stone-950">
      {/* Title bar */}
      {title && (
        <div className="shrink-0 border-b border-stone-800 bg-stone-950 px-4 py-2 grid grid-cols-3 items-center">
          {/* Left: brand home link + save indicator */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-gold)] hover:text-white transition-colors">
              <svg width="8" height="11" viewBox="0 0 10 13" fill="currentColor" aria-hidden><path d="M5 0C5 0 0 5 0 8.5a5 5 0 0 0 10 0C10 5 5 0 5 0z" /></svg>
              By Torchlight
            </Link>
            <div className="relative group">
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-stone-600 text-[10px] text-stone-500 cursor-default select-none group-hover:border-stone-400 group-hover:text-stone-300 transition-colors">
                i
              </span>
              <div className="pointer-events-none absolute left-0 top-6 z-50 w-56 rounded border border-stone-700 bg-stone-900 px-3 py-2 text-xs text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                <span className={`mr-1.5 ${isSaved ? "text-emerald-400" : "text-yellow-400"}`}>
                  {isSaved ? "●" : "○"}
                </span>
                {tooltip}
              </div>
            </div>
          </div>

          {/* Center: campaign title */}
          <span className="text-sm font-semibold text-[var(--color-gold)] tracking-wide text-center truncate px-2">
            {title}
          </span>

          {/* Right: desktop full nav / mobile compact menu */}
          <div className="flex justify-end">
            <div className="hidden md:block">
              <UserNav onHowToPlay={() => setShowHowToPlay(true)} onSettings={() => setShowSettings(true)} />
            </div>
            <div className="md:hidden">
              <MobileMenu onHowToPlay={() => setShowHowToPlay(true)} onSettings={() => setShowSettings(true)} />
            </div>
          </div>
        </div>
      )}

      {/* Desktop layout */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <aside className="w-72 border-r border-stone-800 overflow-y-auto">
          {leftPanel}
        </aside>
        <main className="flex-1 flex flex-col overflow-hidden">
          {centerPanel}
        </main>
        <aside className="w-72 border-l border-stone-800 overflow-y-auto p-4 space-y-4">
          {rightPanel}
        </aside>
      </div>

      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {/* Mobile layout */}
      <div className="md:hidden flex flex-col flex-1 min-h-0">
        <div className="flex-1 min-h-0 overflow-hidden">
          {mobileTab === "left" && <div className="h-full overflow-y-auto">{leftPanel}</div>}
          {mobileTab === "center" && <div className="h-full flex flex-col">{centerPanel}</div>}
          {mobileTab === "right" && <div className="h-full overflow-y-auto p-4 space-y-4">{rightPanel}</div>}
        </div>
        <MobileNav
          activeTab={mobileTab}
          onTabChange={setMobileTab}
          leftLabel={leftTitle}
          rightLabel={rightTitle}
        />
      </div>
    </div>
  );
}
