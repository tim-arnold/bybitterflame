import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Email change approved | By Bitter Flame",
};

// Landing page for the "Approve Email Change" link sent to the current address.
// better-auth appends ?error=... to this URL when the link is invalid or expired.
export default async function EmailChangeConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="absolute inset-0 bg-[url('/bg-woodcut.webp')] bg-cover bg-center" />

      <div className="relative z-10 w-full max-w-sm px-4">
        <h1 className="mb-1 text-center text-3xl font-bold tracking-tight text-[var(--color-gold)]">
          By Bitter Flame
        </h1>
        <p className="mb-8 text-center text-sm text-stone-400">Email change</p>

        <div className="rounded-lg border border-stone-800 bg-stone-950/90 p-6 text-center">
          {error ? (
            <>
              <p className="mb-2 text-sm font-medium text-red-400">This link didn&apos;t work</p>
              <p className="text-sm text-stone-400">
                It may have expired or already been used. Request the email change again from
                your account settings.
              </p>
            </>
          ) : (
            <>
              <p className="mb-2 text-sm font-medium text-stone-200">Change approved</p>
              <p className="text-sm text-stone-400">
                One more step: check the inbox for your <span className="text-stone-200">new</span>{" "}
                email address and click the verification link. Your email won&apos;t change until
                you do.
              </p>
            </>
          )}
          <Link
            href="/account"
            className="mt-6 inline-block text-sm text-stone-400 hover:text-white transition-colors"
          >
            Account settings
          </Link>
        </div>
      </div>
    </div>
  );
}
