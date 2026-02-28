import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "By Torchlight — AI Game Master for Shadowdark RPG",
  description:
    "An AI-powered Game Master for Shadowdark RPG. Create a character and explore deadly dungeons.",
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
