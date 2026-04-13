"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function SiteHeaderLogo() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <Link href="/" className="hover:opacity-80 transition-opacity">
      <Image
        src="/logo-woodcut-header-400.webp"
        alt="By Bitter Flame"
        width={400}
        height={136}
        className="h-[120px] w-auto"
        priority
      />
    </Link>
  );
}
