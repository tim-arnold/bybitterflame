"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

interface UserNavProps {
  onHowToPlay?: () => void;
  onSettings?: () => void;
}

export function UserNav({ onHowToPlay, onSettings }: UserNavProps = {}) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  if (isPending) return null;

  const howToPlayEl = onHowToPlay ? (
    <button
      onClick={onHowToPlay}
      className="rounded border border-stone-700 bg-stone-900/90 px-3 py-1.5 text-xs font-medium text-stone-400 hover:border-stone-500 hover:text-white transition-colors backdrop-blur-sm cursor-pointer"
    >
      How to Play
    </button>
  ) : (
    <a
      href="/how-to-play"
      className="rounded border border-stone-700 bg-stone-900/90 px-3 py-1.5 text-xs font-medium text-stone-400 hover:border-stone-500 hover:text-white transition-colors backdrop-blur-sm"
    >
      How to Play
    </a>
  );

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        {howToPlayEl}
        <a
          href="/request-access"
          className="rounded border border-stone-700 bg-stone-900/90 px-3 py-1.5 text-xs font-medium text-stone-400 hover:border-stone-500 hover:text-white transition-colors backdrop-blur-sm"
        >
          Request access
        </a>
        <a
          href="/login"
          className="rounded border border-stone-600 bg-stone-900/90 px-3 py-1.5 text-xs font-medium text-stone-200 hover:border-stone-400 hover:text-white transition-colors backdrop-blur-sm"
        >
          Sign in
        </a>
      </div>
    );
  }

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
  }

  const howToPlayInlineEl = onHowToPlay ? (
    <button
      onClick={onHowToPlay}
      className="text-stone-400 hover:text-stone-100 transition-colors cursor-pointer"
    >
      How to Play
    </button>
  ) : (
    <Link href="/how-to-play" className="text-stone-400 hover:text-stone-100 transition-colors">
      How to Play
    </Link>
  );

  return (
    <div className="flex items-center gap-2 rounded border border-stone-600 bg-stone-900/90 px-3 py-1.5 text-xs backdrop-blur-sm">
      <span className="hidden sm:block truncate max-w-[160px] text-stone-200 font-medium">
        {session.user.name || session.user.email}
      </span>
      <span className="hidden sm:block text-stone-600">·</span>
      {howToPlayInlineEl}
      <span className="text-stone-600">·</span>
      {onSettings ? (
        <button onClick={onSettings} className="text-stone-400 hover:text-stone-100 transition-colors cursor-pointer">
          Settings
        </button>
      ) : (
        <Link href="/account" className="text-stone-400 hover:text-stone-100 transition-colors">
          Settings
        </Link>
      )}
      <span className="text-stone-600">·</span>
      <button
        onClick={handleSignOut}
        className="text-stone-400 hover:text-stone-100 transition-colors cursor-pointer"
      >
        Sign out
      </button>
    </div>
  );
}
