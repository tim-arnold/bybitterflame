"use client";

import { useRef, useEffect, useState } from "react";
import { MobileNav } from "./MobileNav";
import { UserNav } from "@/components/UserNav";
import { HowToPlayModal } from "@/components/HowToPlayModal";
import { SettingsModal } from "@/components/SettingsModal";
import { BugReportModal } from "@/components/BugReportModal";
import { authClient } from "@/lib/auth/client";
import Image from "next/image";
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

function PauseLeaveButton({ isSaved }: { isSaved: boolean }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-1.5 text-xs transition-colors ${
        isSaved ? "text-stone-400 hover:text-stone-100" : "text-yellow-600 hover:text-yellow-400"
      }`}
      title={
        isSaved
          ? "Your progress is saved — safe to leave"
          : "The GM is still responding — you may lose the current message"
      }
    >
      <svg width="11" height="12" viewBox="0 0 11 12" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="1" y="1" width="9" height="10" rx="1" />
        <path d="M4 4v4M7 4v4" />
      </svg>
      Pause &amp; Leave
    </Link>
  );
}

function MobileMenu({ onHowToPlay, onSettings, onBugReport, onFeatureRequest }: { onHowToPlay: () => void; onSettings: () => void; onBugReport: () => void; onFeatureRequest: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
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
    window.location.href = "/login";
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
        <div className="absolute right-0 top-9 z-50 min-w-[160px] rounded border border-stone-700 bg-stone-900 py-1 shadow-xl">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-stone-300 hover:bg-stone-800 hover:text-white transition-colors"
          >
            Pause &amp; Leave
          </Link>
          <div className="my-1 border-t border-stone-800" />
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
              <button
                onClick={() => { setOpen(false); onBugReport(); }}
                className="w-full px-4 py-2 text-left text-sm text-stone-300 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer"
              >
                Report a Bug
              </button>
              <button
                onClick={() => { setOpen(false); onFeatureRequest(); }}
                className="w-full px-4 py-2 text-left text-sm text-stone-300 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer"
              >
                Suggest Feature
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
  const [showBugReport, setShowBugReport] = useState(false);
  const [showFeatureRequest, setShowFeatureRequest] = useState(false);

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
      if (!layoutRef.current || !vv) return;
      const keyboardHeight = Math.max(0, window.innerHeight - vv.height);
      layoutRef.current.style.paddingBottom = `${keyboardHeight}px`;
    }
    update();
    vv.addEventListener("resize", update);
    return () => {
      vv.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div ref={layoutRef} className="fixed inset-0 overflow-hidden flex flex-col bg-stone-950">

      {/* Skip link — keyboard users bypass sidebar to reach chat input */}
      <a
        href="#chat-input"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[200] focus:top-2 focus:left-1/2 focus:-translate-x-1/2 focus:px-4 focus:py-2 focus:rounded focus:border focus:border-[var(--color-gold)] focus:bg-stone-950 focus:text-[var(--color-gold)] focus:text-sm focus:font-semibold"
      >
        Skip to chat
      </a>

      {/* Mobile header — title + hamburger menu */}
      <div className="md:hidden shrink-0 border-b border-stone-800 bg-stone-950 px-4 py-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-[var(--color-gold)] tracking-wide truncate pr-4">
          {title}
        </span>
        <MobileMenu onHowToPlay={() => setShowHowToPlay(true)} onSettings={() => setShowSettings(true)} onBugReport={() => setShowBugReport(true)} onFeatureRequest={() => setShowFeatureRequest(true)} />
      </div>

      {/* Desktop nav bar — left: bug/feature, right: remaining nav */}
      <div className="hidden md:flex shrink-0 justify-between items-center border-b border-stone-800 bg-stone-950 px-4 py-2">
        <UserNav section="left" onBugReport={() => setShowBugReport(true)} onFeatureRequest={() => setShowFeatureRequest(true)} />
        <UserNav section="right" onHowToPlay={() => setShowHowToPlay(true)} onSettings={() => setShowSettings(true)} middleSlot={<PauseLeaveButton isSaved={isSaved} />} />
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <aside className="w-72 border-r border-stone-800 overflow-y-auto">
          {/* Logo */}
          <div className="flex justify-center items-start px-4 pt-4">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Image
                src="/logo-woodcut-header-400.webp"
                alt="By Bitter Flame"
                width={240}
                height={82}
                className="h-[82px] w-auto"
                priority
              />
            </Link>
          </div>
          {/* Adventure title */}
          {title && (
            <div className="px-4 pb-3 text-center">
              <span className="text-md font-uncial font-semibold text-stone-100 tracking-wide">
                {title}
              </span>
            </div>
          )}
          <div className="border-t border-stone-800" />
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
      {showBugReport && <BugReportModal onClose={() => setShowBugReport(false)} />}
      {showFeatureRequest && <BugReportModal mode="feature" onClose={() => setShowFeatureRequest(false)} />}

      {/* Mobile layout */}
      <div className="md:hidden flex flex-col flex-1 min-h-0">
        <div className="flex-1 min-h-0 overflow-hidden">
          {mobileTab === "left" && <div className="h-full overflow-y-auto">{leftPanel}</div>}
          {mobileTab === "center" && <main className="h-full flex flex-col">{centerPanel}</main>}
          {mobileTab === "right" && (
            <div className="h-full overflow-y-auto p-4 space-y-4">
              {rightPanel}
            </div>
          )}
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