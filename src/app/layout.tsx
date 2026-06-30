import type { Metadata } from "next";
import { Orbitron, Rajdhani } from "next/font/google";

import "./globals.css";

const headingFont = Orbitron({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "700", "800"],
});

const bodyFont = Rajdhani({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Overwatch Dating",
  description: "Find duos, chaos partners, and late-night ranked chemistry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
