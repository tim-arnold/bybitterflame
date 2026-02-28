import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://bytorchlight.com"),
  title: {
    default: "By Torchlight — AI Game Master for Shadowdark RPG",
    template: "%s | By Torchlight",
  },
  description:
    "An AI-powered Game Master for Shadowdark RPG. Create a character and explore deadly dungeons guided by Claude AI — no experience required.",
  keywords: [
    "Shadowdark RPG",
    "AI dungeon master",
    "AI game master",
    "tabletop RPG",
    "solo RPG",
    "dungeon crawler",
    "By Torchlight",
  ],
  openGraph: {
    type: "website",
    siteName: "By Torchlight",
    title: "By Torchlight — AI Game Master for Shadowdark RPG",
    description:
      "An AI-powered Game Master for Shadowdark RPG. Create a character and explore deadly dungeons guided by Claude AI.",
    url: "https://bytorchlight.com",
    images: [
      {
        url: "https://bytorchlight.com/dungeon-background.webp",
        width: 1536,
        height: 1024,
        alt: "A torchlit dungeon corridor — By Torchlight AI Game Master",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "By Torchlight — AI Game Master for Shadowdark RPG",
    description:
      "An AI-powered Game Master for Shadowdark RPG. Create a character and explore deadly dungeons.",
    images: ["https://bytorchlight.com/dungeon-background.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-285WWGVN6Z" strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-285WWGVN6Z');
        `}</Script>
        {children}
      </body>
    </html>
  );
}
