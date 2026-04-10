// app/layout.tsx — Root layout (required by Next.js App Router)
// The <html> and <body> tags MUST live here and only here.
// Always dark. Theme toggling is scoped inside (pages)/layout.tsx.

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BlaRiva — Enterprise AI Knowledge Hub",
  description:
    "Upload documents, define departments, and let AI answer every question your staff and clients have — instantly, accurately, 24/7.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}