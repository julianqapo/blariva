// ============================================================
// FILE LOCATION: app/layout.tsx
// (This is the ROOT layout — place it directly inside your app/ folder)
// ============================================================

import type { Metadata } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Display font — bold, geometric, unforgettable
const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Mono for code/editor
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "BlaRiva — Enterprise AI Knowledge Hub",
  description:
    "Upload documents, define departments, and let AI answer every question your staff and clients have — instantly, accurately, 24/7.",
};

// ─────────────────────────────────────────────
//  ROOT LAYOUT — wraps EVERY page
//  The sidebar lives inside (dashboard)/layout.tsx only.
//  This layout intentionally has no sidebar.
// ─────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-obsidian">{children}</body>
    </html>
  );
}