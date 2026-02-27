"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export function UserNav() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  if (isPending) return null;

  if (!session) {
    return (
      <a
        href="/login"
        className="rounded border border-stone-600 bg-stone-900/90 px-3 py-1.5 text-xs font-medium text-stone-200 hover:border-stone-400 hover:text-white transition-colors backdrop-blur-sm"
      >
        Sign in
      </a>
    );
  }

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <div className="flex items-center gap-2 rounded border border-stone-600 bg-stone-900/90 px-3 py-1.5 text-xs backdrop-blur-sm">
      <span className="hidden sm:block truncate max-w-[160px] text-stone-200 font-medium">
        {session.user.name || session.user.email}
      </span>
      <span className="hidden sm:block text-stone-600">·</span>
      <button
        onClick={handleSignOut}
        className="text-stone-400 hover:text-stone-100 transition-colors cursor-pointer"
      >
        Sign out
      </button>
    </div>
  );
}
