// app/(pages)/layout.tsx
// Pages inside (pages) get the sidebar + top bar + theme toggle.

import { AppShell } from "@/components/app-shell";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}