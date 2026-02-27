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
        className="rounded border border-stone-700 bg-stone-900/80 px-3 py-1.5 text-xs font-medium text-stone-300 hover:border-stone-500 hover:text-stone-100 transition-colors"
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
    <div className="flex items-center gap-3 text-xs text-stone-500">
      <span className="hidden sm:block truncate max-w-[160px]">{session.user.name || session.user.email}</span>
      <button
        onClick={handleSignOut}
        className="hover:text-stone-300 transition-colors cursor-pointer"
      >
        Sign out
      </button>
    </div>
  );
}
