// ============================================================
// FILE LOCATION: app/(dashboard)/layout.tsx
// Step 1: Inside your app/ folder, create a folder named exactly: (dashboard)
//         The parentheses are part of the folder name — do not remove them.
// Step 2: Put this layout.tsx file inside that (dashboard) folder.
// Result: Every page inside (dashboard) will have the sidebar + top bar.
//         Pages outside (dashboard) like /login and /signup will NOT.
// ============================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Departments",
    href: "/departments",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    label: "Public Agent",
    href: "/public-agent",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
  },
  {
    label: "Chat",
    href: "/chat",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    label: "Staff",
    href: "/staff",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: "Billing",
    href: "/billing",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
];

// Derive a human-readable page title from the current URL path
function usePageTitle() {
  const pathname = usePathname();
  const segment = pathname.split("/").filter(Boolean).pop() ?? "dashboard";
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const pageTitle = usePageTitle();

  return (
    <div className="app-shell">

      {/* ── Sidebar (fixed, left) ─────────────────────────── */}
      <aside className="sidebar">

        {/* Logo */}
        <div className="p-5" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <div className="logo-mark">
              <span className="logo-b">B</span>
            </div>
            <span
              className="font-display text-base font-bold"
              style={{ color: "var(--text)" }}
            >
              BlaRiva
            </span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 mt-2" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive ? "nav-item-active" : ""
                }`}
                style={{
                  color: isActive ? "var(--primary)" : "var(--muted)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.05)";
                    (e.currentTarget as HTMLElement).style.color = "var(--text)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "";
                    (e.currentTarget as HTMLElement).style.color = "var(--muted)";
                  }
                }}
              >
                <span style={{ color: isActive ? "var(--primary)" : "inherit" }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User card at bottom */}
        <div className="p-4" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                background: "rgba(245,158,11,0.15)",
                border: "1px solid rgba(245,158,11,0.3)",
                color: "var(--primary)",
              }}
            >
              J
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="text-sm font-medium truncate"
                style={{ color: "var(--text)" }}
              >
                Jane Smith
              </div>
              <div className="text-xs truncate" style={{ color: "var(--muted)" }}>
                Admin
              </div>
            </div>
            {/* Settings icon */}
            <button
              className="flex-shrink-0 rounded-md p-1 transition-colors"
              style={{ color: "var(--muted)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--primary)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--muted)")}
              title="Settings"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Right column: topbar + page body ────────────── */}
      <div className="sidebar-content">

        {/* Top bar — sticky, spans the full right column */}
        <header className="topbar">
          {/* Left: page title */}
          <div className="flex items-center gap-3">
            <h1
              className="font-display text-base font-bold"
              style={{ color: "var(--text)" }}
            >
              {pageTitle}
            </h1>
          </div>

          {/* Right: search + notifications + help */}
          <div className="flex items-center gap-3">

            {/* Search bar */}
            <div className="relative hidden sm:block">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                style={{ color: "var(--muted)" }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search…"
                className="auth-input"
                style={{
                  paddingLeft: "2rem",
                  height: "36px",
                  width: "200px",
                  fontSize: "0.8125rem",
                  borderRadius: "0.5rem",
                }}
              />
            </div>

            {/* Notification bell */}
            <button
              className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
              style={{
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--muted)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)";
                (e.currentTarget as HTMLElement).style.color = "var(--primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.color = "var(--muted)";
              }}
              title="Notifications"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {/* Unread dot */}
              <span
                className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--primary)" }}
              />
            </button>

            {/* Help (?) button */}
            <button
              className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
              style={{
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--muted)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)";
                (e.currentTarget as HTMLElement).style.color = "var(--primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.color = "var(--muted)";
              }}
              title="Help — how to use this page"
            >
              ?
            </button>
          </div>
        </header>

        {/* Page content — scrollable */}
        <main className="page-body">
          {children}
        </main>

      </div>
    </div>
  );
}