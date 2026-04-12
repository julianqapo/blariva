// ============================================================
// FILE LOCATION: components/AppShell.tsx
// ============================================================
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/app/utils/supabase_browser';
import {
  LayoutDashboard, Library, MessageSquare, Bot, LineChart,
  Shield, Settings, Search, Bell, ChevronRight,
  Sun, Moon, HelpCircle, LogOut, Menu, X,
} from 'lucide-react';

import { HelpModal } from './help/help-modal';
import { HELP_CONTENT } from './help/help-content';

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  initials: string;
}

const STORAGE_KEY = 'blariva-theme';

function useLocalTheme() {
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as 'dark' | 'light' | null;
    if (stored) setThemeState(stored);
    setMounted(true);
  }, []);

  const setTheme = (t: 'dark' | 'light') => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
  };

  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  return { theme, toggle, mounted };
}

// ── Nav Item with fixed-width icon column ──
const NavItem = ({
  icon,
  label,
  href,
  isActive,
  expanded,
  onClick,
}: {
  icon: React.ReactElement;
  label: string;
  href: string;
  isActive: boolean;
  expanded: boolean;
  onClick?: () => void;
}) => (
  <Link
    href={href}
    onClick={onClick}
    title={!expanded ? label : undefined}
    className={`
      relative flex items-center rounded-xl
      transition-all duration-200 ease-out
      group
      ${expanded
        ? `hover:translate-x-1 hover:scale-[1.02] active:scale-[0.98] active:translate-x-0
           ${isActive ? 'translate-x-1 scale-[1.02]' : ''}`
        : 'hover:scale-110 active:scale-95'
      }
      ${
        isActive
          ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 font-semibold'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-slate-200 font-medium'
      }
    `}
  >
    {/* Fixed-width icon container — always centered in the collapsed sidebar column */}
    <div className="w-[68px] shrink-0 flex items-center justify-center py-2.5">
      <div className={`${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'} transition-opacity`}>
        {React.cloneElement(icon, { size: 18 } as any)}
      </div>
    </div>

    {/* Label */}
    <span
      className={`
        text-sm tracking-wide whitespace-nowrap overflow-hidden
        transition-all duration-300 ease-out
        ${expanded ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0'}
      `}
    >
      {label}
    </span>

    {/* Active indicator */}
    {isActive && expanded && (
      <div className="ml-auto mr-3 w-1 h-4 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)] dark:shadow-[0_0_8px_rgba(245,158,11,0.6)] shrink-0" />
    )}

    {/* Collapsed tooltip */}
    {!expanded && (
      <div className="
        pointer-events-none absolute left-full ml-3 z-50
        px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap
        bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900
        shadow-lg opacity-0 group-hover:opacity-100
        translate-x-1 group-hover:translate-x-0
        transition-all duration-150 ease-out
      ">
        {label}
        <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-slate-900 dark:bg-slate-100 rotate-45" />
      </div>
    )}
  </Link>
);

// ── Animated Hamburger / Close icon ──
const HamburgerIcon = ({ open }: { open: boolean }) => (
  <div className="w-5 h-5 flex flex-col justify-center items-center gap-[5px] relative">
    <span className={`
      block h-[2px] bg-current rounded-full
      transition-all duration-300 ease-out origin-center
      ${open ? 'w-5 rotate-45 translate-y-[7px]' : 'w-5'}
    `} />
    <span className={`
      block h-[2px] bg-current rounded-full
      transition-all duration-300 ease-out
      ${open ? 'w-0 opacity-0' : 'w-4 opacity-100'}
    `} />
    <span className={`
      block h-[2px] bg-current rounded-full
      transition-all duration-300 ease-out origin-center
      ${open ? 'w-5 -rotate-45 -translate-y-[7px]' : 'w-5'}
    `} />
  </div>
);

export function AppShell({
  children,
  user
}: {
  children: React.ReactNode;
  user: UserProfile | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  const { theme, toggle, mounted } = useLocalTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopHovered, setDesktopHovered] = useState(false);
  const desktopExpanded = desktopHovered;

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleNavClick = useCallback(() => setMobileOpen(false), []);

 const PAGE_NAMES: Record<string, string> = {
  '/dashboard': 'Overview',
  '/library':   'Knowledge Library',
  '/chat':      'AI Workspace',
  '/builder':   'Agent Builder',
  '/analytics': 'Analytics',
  '/admin':     'Admin & Roles',
  '/settings':  'Settings',
};

const getPageName = () => {
  // Exact match first
  if (PAGE_NAMES[pathname]) return PAGE_NAMES[pathname];
  // Partial match for nested routes (e.g. /library/123)
  const segment = '/' + (pathname.split('/').filter(Boolean)[0] ?? '');
  return PAGE_NAMES[segment] ?? pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ?? 'Overview';
};

  const handleSignOut = async () => {
    setMobileOpen(false);
    await supabase.auth.signOut();
    router.push('/member');
  };

  if (!mounted) return null;

  const AUTH_ROUTES = ['/admin', '/member', '/verify'];
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname?.startsWith(r));
  if (isAuthRoute) return <>{children}</>;

  const helpContent =
    HELP_CONTENT[pathname] ?? HELP_CONTENT[`/${pathname.split('/')[1]}`];

  // ── Shared sidebar internals ──
  const SidebarContent = ({
    expanded,
    isMobile = false,
  }: {
    expanded: boolean;
    isMobile?: boolean;
  }) => (
    <>
      {/* Logo row — uses the same fixed icon column approach */}
      <div className="h-20 flex items-center shrink-0">
        {expanded ? (
          <div className="flex items-center flex-1 overflow-hidden">
            <div className="w-[68px] shrink-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <span className="text-white dark:text-slate-950 font-bold text-lg tracking-tighter">B</span>
              </div>
            </div>
            <span className="text-slate-900 dark:text-slate-100 font-semibold text-xl tracking-tight whitespace-nowrap transition-all duration-300 ease-out opacity-100">BlaRiva</span>
            {isMobile && (
              <button
                onClick={() => setMobileOpen(false)}
                className="ml-auto mr-4 w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                aria-label="Close sidebar"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ) : (
          <div className="w-[68px] shrink-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <span className="text-white dark:text-slate-950 font-bold text-lg tracking-tighter">B</span>
            </div>
          </div>
        )}
      </div>

      {/* User identity */}
      {user && (
        <div className="pb-4 shrink-0">
          {expanded ? (
            <div className="mx-4 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                <span className="text-xs font-bold text-white dark:text-slate-950">{user.initials}</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-200 truncate leading-tight">{user.name}</div>
                <div className="text-[11px] text-slate-400 truncate leading-tight">{user.email}</div>
              </div>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 uppercase tracking-wide shrink-0">
                {user.role}
              </span>
            </div>
          ) : (
            <div className="w-[68px] flex justify-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                <span className="text-xs font-bold text-white dark:text-slate-950">{user.initials}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="mx-3 mb-4 h-px bg-slate-200 dark:bg-white/[0.04] shrink-0" />

      {/* Nav links — no horizontal padding; the NavItem's fixed icon column handles alignment */}
      <div className="flex-1 flex flex-col gap-1 overflow-y-auto px-0">
        {expanded && (
          <div className="px-7 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Platform
          </div>
        )}
        {!expanded && <div className="mb-2 h-4" />}

        <NavItem icon={<LayoutDashboard />} label={PAGE_NAMES["/dashboard"]}         href="/dashboard" isActive={pathname === '/dashboard'} expanded={expanded} onClick={isMobile ? handleNavClick : undefined} />
        <NavItem icon={<Library />}         label={PAGE_NAMES["/library"]} href="/library"   isActive={pathname === '/library'}   expanded={expanded} onClick={isMobile ? handleNavClick : undefined} />
        <NavItem icon={<MessageSquare />}   label={PAGE_NAMES["/chat"]}      href="/chat"      isActive={pathname === '/chat'}      expanded={expanded} onClick={isMobile ? handleNavClick : undefined} />
        <NavItem icon={<Bot />}             label={PAGE_NAMES["/builder"]}     href="/builder"   isActive={pathname === '/builder'}   expanded={expanded} onClick={isMobile ? handleNavClick : undefined} />
        <NavItem icon={<LineChart />}       label={PAGE_NAMES["/analytics"]}         href="/analytics" isActive={pathname === '/analytics'} expanded={expanded} onClick={isMobile ? handleNavClick : undefined} />

        <div className="h-px bg-slate-200 dark:bg-white/[0.04] my-4 mx-3" />

        {expanded && (
          <div className="px-7 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Governance
          </div>
        )}
        <NavItem icon={<Shield />}   label={PAGE_NAMES["/admin"]}    href="/admin"    isActive={pathname === '/admin'}    expanded={expanded} onClick={isMobile ? handleNavClick : undefined} />
        <NavItem icon={<Settings />} label={PAGE_NAMES["/settings"]}      href="/settings" isActive={pathname === '/settings'} expanded={expanded} onClick={isMobile ? handleNavClick : undefined} />
      </div>

      {/* Sign out — same fixed icon column pattern */}
      <div className="border-t border-slate-200 dark:border-white/[0.04] shrink-0">
        <button
          onClick={handleSignOut}
          title={!expanded ? 'Sign Out' : undefined}
          className="
            w-full flex items-center rounded-xl
            text-slate-500 dark:text-slate-400
            hover:bg-red-50 dark:hover:bg-red-500/10
            hover:text-red-600 dark:hover:text-red-400
            transition-all duration-200 ease-out group relative
          "
        >
          <div className="w-[68px] shrink-0 flex items-center justify-center py-2.5">
            <LogOut size={17} className="opacity-70 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className={`
            text-sm font-medium tracking-wide whitespace-nowrap overflow-hidden
            transition-all duration-300
            ${expanded ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0'}
          `}>
            Sign Out
          </span>
          {/* Collapsed tooltip */}
          {!expanded && (
            <div className="
              pointer-events-none absolute left-full ml-3 z-50
              px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap
              bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900
              shadow-lg opacity-0 group-hover:opacity-100
              translate-x-1 group-hover:translate-x-0
              transition-all duration-150 ease-out
            ">
              Sign Out
              <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-slate-900 dark:bg-slate-100 rotate-45" />
            </div>
          )}
        </button>
      </div>
    </>
  );

  return (
    <div className={`${theme === 'dark' ? 'dark' : 'light-override'} h-screen w-full overflow-hidden transition-colors duration-500`}>
      <div className="h-full w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-300 selection:bg-amber-500/30 selection:text-amber-900 dark:selection:text-amber-200 flex relative transition-colors duration-500">

        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/10 dark:bg-amber-500/5 blur-[100px] dark:blur-[120px] rounded-full pointer-events-none z-0 transition-all duration-700" />

        {/* ── DESKTOP SIDEBAR ── */}
        <nav
          onMouseEnter={() => setDesktopHovered(true)}
          onMouseLeave={() => setDesktopHovered(false)}
          className={`
            hidden lg:flex flex-col shrink-0
            border-r border-slate-200 dark:border-white/[0.04]
            bg-white/70 dark:bg-slate-950/50 backdrop-blur-xl
            shadow-sm dark:shadow-none z-20
            transition-all duration-300 ease-out
            overflow-hidden
            ${desktopExpanded ? 'w-64' : 'w-[68px]'}
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <SidebarContent expanded={desktopExpanded} isMobile={false} />
        </nav>

        {/* ── MOBILE BACKDROP ── */}
        <div
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
          className={`
            lg:hidden fixed inset-0 z-30
            bg-black/50 backdrop-blur-[2px]
            transition-opacity duration-300 ease-out
            ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
          `}
        />

        {/* ── MOBILE DRAWER ── */}
        <nav
          className={`
            lg:hidden fixed inset-y-0 left-0 w-72 z-40 flex flex-col
            bg-white dark:bg-slate-950
            border-r border-slate-200 dark:border-white/[0.06]
            shadow-2xl shadow-black/20 dark:shadow-black/60
            transition-transform duration-300 ease-out
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          aria-label="Mobile navigation"
          aria-hidden={!mobileOpen}
        >
          <SidebarContent expanded={true} isMobile={true} />
        </nav>

        {/* ── MAIN CONTENT ── */}
        <div className={`
          flex-1 flex flex-col relative z-10 overflow-hidden
          transition-all duration-700 delay-100 ease-out
          ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}>

          <header className="h-16 lg:h-20 border-b border-slate-200 dark:border-white/[0.04] bg-white/60 dark:bg-slate-950/30 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20 transition-colors duration-500 shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen((prev) => !prev)}
                className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 active:scale-90 transition-all duration-200"
                aria-label={mobileOpen ? 'Close sidebar' : 'Open sidebar'}
                aria-expanded={mobileOpen}
              >
                <HamburgerIcon open={mobileOpen} />
              </button>

              <div className="lg:hidden flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                  <span className="text-white font-bold text-xs">B</span>
                </div>
                <span className="text-slate-900 dark:text-slate-100 font-semibold text-base tracking-tight">BlaRiva</span>
              </div>

              <div className="hidden lg:flex items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                <span>BlaRiva OS</span>
                <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />
                <span className="text-slate-900 dark:text-slate-100">{getPageName()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-4 xl:gap-6">
              <div className="relative group hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-32 md:w-44 lg:w-64 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-full py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner dark:shadow-none"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex gap-1">
                  <kbd className="px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-[10px] text-slate-400 font-mono shadow-sm">⌘</kbd>
                  <kbd className="px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-[10px] text-slate-400 font-mono shadow-sm">K</kbd>
                </div>
              </div>

              <div className="h-6 w-px bg-slate-200 dark:bg-white/10" />

              {helpContent && (
                <button
                  onClick={() => setIsHelpOpen(true)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                  aria-label="Open page guide"
                >
                  <HelpCircle size={18} />
                </button>
              )}

              <button
                onClick={toggle}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white dark:ring-slate-950" />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        content={helpContent}
      />
    </div>
  );
}
