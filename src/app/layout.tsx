import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shadowdark RPG - AI Game Master",
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
        {children}
      </body>
    </html>
  );
}
