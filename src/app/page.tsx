import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <h1 className="mb-2 text-5xl font-bold tracking-tight text-[var(--color-gold)]">
        Shadowdark
      </h1>
      <p className="mb-1 text-lg text-stone-400">AI Game Master</p>
      <p className="narrative mb-10 max-w-md text-stone-500">
        The torchlight flickers against damp stone walls. Something stirs in the
        darkness ahead. Will you press on?
      </p>

      <Link
        href="/create"
        className="rounded-lg border border-[var(--color-gold-dim)] bg-stone-900 px-8 py-3 text-lg font-semibold text-[var(--color-gold)] transition-colors hover:border-[var(--color-gold)] hover:bg-stone-800"
      >
        Begin Your Adventure
      </Link>

      <p className="mt-6 text-xs text-stone-600">
        Powered by the Shadowdark RPG rules by The Arcane Library
      </p>
    </div>
  );
}
