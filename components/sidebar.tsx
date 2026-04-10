"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Library,
  MessageSquare,
  Bot,
  LineChart,
  Shield,
  Settings,
  MoreHorizontal,
  ChevronRight,
  Search,
  Bell,
  Sun,
  Moon,
  LucideIcon
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

export type SidebarTab = "dashboard" | "library" | "chat" | "agent" | "admin" | "settings";

type SidebarProps = {
  activeTab?: SidebarTab;
  onTabChange?: (tab: SidebarTab) => void;
  children: React.ReactNode;
  user?: {
    initials?: string;
    name?: string;
    role?: string;
  };
};

const NavItem = ({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
      isActive
        ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 font-semibold"
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.03] hover:text-slate-900 dark:hover:text-slate-200 font-medium"
    }`}
  >
    <div className={`${isActive ? "opacity-100" : "opacity-70"}`}>
      {icon}
    </div>
    <span className="text-sm tracking-wide">{label}</span>
    {isActive && (
      <div className="ml-auto w-1 h-4 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)] dark:shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
    )}
  </button>
);

export function Sidebar({
  activeTab = "dashboard",
  onTabChange,
  children,
  user = {
    initials: "JD",
    name: "Jane Doe",
    role: "Enterprise Admin",
  },
}: SidebarProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-300 flex relative transition-colors duration-500 overflow-hidden">
      {/* Ambient brand glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/10 dark:bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Sidebar Widget */}
      <nav
        className={`w-64 border-r border-slate-200 dark:border-white/[0.04] bg-white/70 dark:bg-slate-950/50 backdrop-blur-xl flex flex-col transition-transform duration-700 ease-out z-20 shrink-0 ${
          isLoaded ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-20 flex items-center px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_4px_15px_rgba(245,158,11,0.25)] dark:shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <span className="text-white dark:text-slate-950 font-bold text-lg tracking-tighter">
                B
              </span>
            </div>
            <span className="text-slate-900 dark:text-slate-100 font-semibold text-xl tracking-tight">
              BlaRiva
            </span>
          </div>
        </div>

        <div className="flex-1 py-6 px-4 flex flex-col gap-1 overflow-y-auto">
          <div className="px-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Platform
          </div>
          <NavItem
            icon={<LayoutDashboard size={18} />}
            label="Overview"
            isActive={activeTab === "dashboard"}
            onClick={() => onTabChange?.("dashboard")}
          />
          <NavItem
            icon={<Library size={18} />}
            label="Knowledge Library"
            isActive={activeTab === "library"}
            onClick={() => onTabChange?.("library")}
          />
          <NavItem
            icon={<MessageSquare size={18} />}
            label="AI Workspace"
            isActive={activeTab === "chat"}
            onClick={() => onTabChange?.("chat")}
          />
          <NavItem
            icon={<Bot size={18} />}
            label="Agent Builder"
            isActive={activeTab === "agent"}
            onClick={() => onTabChange?.("agent")}
          />

          <div className="px-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-8 mb-2">
            Governance
          </div>
          <NavItem
            icon={<Shield size={18} />}
            label="Admin & Roles"
            isActive={activeTab === "admin"}
            onClick={() => onTabChange?.("admin")}
          />
          <NavItem
            icon={<Settings size={18} />}
            label="Settings"
            isActive={activeTab === "settings"}
            onClick={() => onTabChange?.("settings")}
          />
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-white/[0.04]">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.03] transition-colors cursor-pointer group">
            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-white/10 group-hover:border-slate-300 dark:group-hover:border-white/20 transition-colors shrink-0">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                {user.initials}
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-200 truncate">
                {user.name}
              </div>
              <div className="text-xs text-slate-500 truncate">{user.role}</div>
            </div>
            <MoreHorizontal size={16} className="text-slate-400 shrink-0" />
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Top Bar Widget */}
        <header className="h-20 border-b border-slate-200 dark:border-white/[0.04] bg-white/60 dark:bg-slate-950/30 backdrop-blur-xl flex items-center justify-between px-8 transition-colors duration-500 shrink-0">
          <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
            <span>BlaRiva OS</span>
            <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />
            <span className="text-slate-900 dark:text-slate-100 capitalize">
              {activeTab}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
              <input
                type="text"
                placeholder="Search knowledge..."
                className="w-48 lg:w-64 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-full py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
              />
            </div>

            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
            >
              {theme === "dark" || theme === "system" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white dark:ring-slate-950"></span>
            </button>
          </div>
        </header>

        {/* The Screen Inside */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
}
