import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://bybitterflame.com"),
  title: {
    default: "By Bitter Flame — AI Fantasy Adventure",
    template: "%s | By Bitter Flame",
  },
  description:
    "An AI-powered Fantasy Adventure. Create a character and explore a fading world by torchlight — no experience required.",
  keywords: [
    "AI dungeon master",
    "AI game master",
    "tabletop RPG",
    "solo RPG",
    "dungeon crawler",
    "By Bitter Flame",
  ],
  openGraph: {
    type: "website",
    siteName: "By Bitter Flame",
    title: "By Bitter Flame — AI Fantasy Adventure",
    description:
      "An AI-powered Fantasy Adventure. Create a character and explore a fading world by torchlight.",
    url: "https://bybitterflame.com",
    images: [
      {
        url: "https://bybitterflame.com/bybitterflame-socialimage.png",
        width: 1200,
        height: 630,
        alt: "By Bitter Flame — AI Fantasy Adventure",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "By Bitter Flame — AI Fantasy Adventure",
    description:
      "An AI-powered Fantasy Adventure. Create a character and explore a fading world by torchlight.",
    images: ["https://bybitterflame.com/bybitterflame-socialimage.png"],
  },
  alternates: {
    canonical: "https://bybitterflame.com",
  },
  robots: {
    index: false,
    follow: false,
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
        {/* Disable browser scroll restoration so pages always start at the top.
            Must run synchronously before the browser applies any saved scroll position. */}
        <Script id="scroll-restoration" strategy="beforeInteractive">{`history.scrollRestoration='manual';`}</Script>
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
