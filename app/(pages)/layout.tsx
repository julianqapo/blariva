// ============================================================
// FILE LOCATION: app/(dashboard)/layout.tsx
// Step 1: Inside your app/ folder, create a folder named exactly: (dashboard)
//         The parentheses are part of the folder name — do not remove them.
// Step 2: Put this layout.tsx file inside that (dashboard) folder.
// Result: Every page inside (dashboard) will have the sidebar + top bar.
//         Pages outside (dashboard) like /login and /signup will NOT.
// ============================================================

import { AppShell } from "@/components/app-shell";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}