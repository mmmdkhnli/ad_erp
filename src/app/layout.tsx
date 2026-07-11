import type { Metadata } from "next";
import { Inter, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-space-grotesk",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AdErp — Reklam istehsalatı ERP",
  description: "Reklam istehsalatı şirkəti üçün idarəetmə sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="az"
      className={`${inter.variable} ${spaceGrotesk.variable} ${plexMono.variable} antialiased`}
      suppressHydrationWarning
    >
      {/* suppressHydrationWarning: brauzer genişlənmələri (ColorZilla, Grammarly və s.)
          <body>-yə atribut əlavə edir; bu, real uyğunsuzluq deyil. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
