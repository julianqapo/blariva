// ============================================================
// FILE LOCATION: app/layout.tsx
// (This is the ROOT layout — place it directly inside your app/ folder)
// ============================================================

import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

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
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full bg-slate-50 dark:bg-slate-950">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}