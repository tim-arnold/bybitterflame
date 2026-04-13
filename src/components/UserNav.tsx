"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";
import { BugReportModal } from "@/components/BugReportModal";

interface UserNavProps {
  section?: "left" | "right";
  middleSlot?: React.ReactNode;
  isAdmin?: boolean;
  onHowToPlay?: () => void;
  onSettings?: () => void;
  onBugReport?: () => void;
  onFeatureRequest?: () => void;
}

function BookIcon() {
  return (
    <svg width="13" height="12" viewBox="0 0 13 12" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" aria-hidden>
      <path d="M6.5 10.5V2M6.5 2C6.5 2 4 1 1 2v9c3-1 5.5 0 5.5 0M6.5 2c0 0 2.5-1 5.5 0v9c-3-1-5.5 0-5.5 0" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" aria-hidden>
      <circle cx="6" cy="6" r="2" />
      <path d="M6 1v1M6 10v1M1 6h1M10 6h1M2.5 2.5l.7.7M8.8 8.8l.7.7M9.5 2.5l-.7.7M3.2 8.8l-.7.7" />
    </svg>
  );
}

function BugIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="6" cy="7" r="3" />
      <path d="M4 4c0-1.1.9-2 2-2s2 .9 2 2" />
      <path d="M1 7h2M9 7h2M3 4.5L1 3M9 4.5l2-1.5M3 9.5L1 11M9 9.5l2 1.5" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 1a4 4 0 0 1 2 7.46V9.5H4V8.46A4 4 0 0 1 6 1z" />
      <path d="M4 10.5h4M4.5 11.5h3" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 1L1.5 3v3c0 2.5 2 4.5 4.5 5 2.5-.5 4.5-2.5 4.5-5V3L6 1z" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 2H2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h3" />
      <path d="M8 9l3-3-3-3M11 6H5" />
    </svg>
  );
}

export function UserNav({ section, middleSlot, isAdmin = false, onHowToPlay, onSettings, onBugReport, onFeatureRequest }: UserNavProps = {}) {
  const { data: session, isPending } = authClient.useSession();
  const [showBugReport, setShowBugReport] = useState(false);
  const [showFeatureRequest, setShowFeatureRequest] = useState(false);

  if (isPending) return null;

  const handleBugReport = onBugReport ?? (() => setShowBugReport(true));
  const handleFeatureRequest = onFeatureRequest ?? (() => setShowFeatureRequest(true));

  const howToPlayEl = onHowToPlay ? (
    <button
      onClick={onHowToPlay}
      className="flex items-center gap-1.5 hover:text-stone-100 transition-colors cursor-pointer"
    >
      <BookIcon />
      How to Play
    </button>
  ) : (
    <Link href="/how-to-play" className="flex items-center gap-1.5 hover:text-stone-100 transition-colors">
      <BookIcon />
      How to Play
    </Link>
  );

  if (!session) {
    if (section === "left") return null;
    return (
      <nav className="flex items-center gap-5 text-xs text-stone-400">
        <Link href="/request-access" className="hover:text-stone-100 transition-colors">
          Request access
        </Link>
        <Link href="/login" className="text-stone-200 hover:text-white transition-colors">
          Sign in
        </Link>
      </nav>
    );
  }

  async function handleSignOut() {
    await authClient.signOut();
    window.location.href = "/login";
  }

  const settingsEl = onSettings ? (
    <button
      onClick={onSettings}
      className="flex items-center gap-1.5 hover:text-stone-100 transition-colors cursor-pointer"
    >
      <GearIcon />
      Settings
    </button>
  ) : (
    <Link href="/account" className="flex items-center gap-1.5 hover:text-stone-100 transition-colors">
      <GearIcon />
      Settings
    </Link>
  );

  const isAdminUser = isAdmin;

  if (section === "left") {
    return (
      <>
        <nav className="flex items-center gap-5 text-xs text-stone-400">
          <button
            onClick={handleBugReport}
            className="flex items-center gap-1.5 transition-colors cursor-pointer"
            style={{ color: "#CFF200" }}
          >
            <BugIcon />
            Report a Bug
          </button>
          <button
            onClick={handleFeatureRequest}
            className="flex items-center gap-1.5 transition-colors cursor-pointer text-sky-400"
          >
            <LightbulbIcon />
            Suggest Feature
          </button>
          {isAdminUser && (
            <Link href="/admin" className="flex items-center gap-1.5 hover:text-stone-100 transition-colors text-amber-500">
              <ShieldIcon />
              Admin
            </Link>
          )}
        </nav>
        {showBugReport && <BugReportModal onClose={() => setShowBugReport(false)} />}
        {showFeatureRequest && <BugReportModal mode="feature" onClose={() => setShowFeatureRequest(false)} />}
      </>
    );
  }

  if (section === "right") {
    return (
      <nav className="flex items-center gap-5 text-xs text-stone-400">
        {howToPlayEl}
        {settingsEl}
        {middleSlot}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 hover:text-stone-100 transition-colors cursor-pointer"
        >
          <SignOutIcon />
          Sign out
        </button>
      </nav>
    );
  }

  return (
    <>
      <nav className="flex items-center gap-5 text-xs text-stone-400">
        {howToPlayEl}
        {settingsEl}
        <button
          onClick={handleBugReport}
          className="flex items-center gap-1.5 transition-colors cursor-pointer"
          style={{ color: "#CFF200" }}
        >
          <BugIcon />
          Report a Bug
        </button>
        <button
          onClick={handleFeatureRequest}
          className="flex items-center gap-1.5 transition-colors cursor-pointer text-sky-400"
        >
          <LightbulbIcon />
          Suggest Feature
        </button>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 hover:text-stone-100 transition-colors cursor-pointer"
        >
          <SignOutIcon />
          Sign out
        </button>
      </nav>
      {showBugReport && <BugReportModal onClose={() => setShowBugReport(false)} />}
      {showFeatureRequest && <BugReportModal mode="feature" onClose={() => setShowFeatureRequest(false)} />}
    </>
  );
}
