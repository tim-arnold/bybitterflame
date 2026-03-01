"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

interface UserNavProps {
  onHowToPlay?: () => void;
  onSettings?: () => void;
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

function SignOutIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 2H2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h3" />
      <path d="M8 9l3-3-3-3M11 6H5" />
    </svg>
  );
}

export function UserNav({ onHowToPlay, onSettings }: UserNavProps = {}) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  if (isPending) return null;

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
    return (
      <nav className="flex items-center gap-5 text-xs text-stone-400">
        {howToPlayEl}
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
    router.push("/login");
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

  return (
    <nav className="flex items-center gap-5 text-xs text-stone-400">
      <span className="hidden sm:block truncate max-w-[140px] text-stone-500">
        {session.user.name || session.user.email}
      </span>
      {howToPlayEl}
      {settingsEl}
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
