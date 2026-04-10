"use client";

import React from "react";
import {
  LayoutDashboard,
  Library,
  MessageSquare,
  Bot,
  LineChart,
  Shield,
  Settings,
  MoreHorizontal,
  LucideIcon,
} from "lucide-react";

export type SidebarTab = "dashboard" | "chat";

type SidebarProps = {
  activeTab?: SidebarTab;
  onTabChange?: (tab: SidebarTab) => void;
  className?: string;
  user?: {
    initials?: string;
    name?: string;
    role?: string;
  };
};

type NavItemConfig = {
  label: string;
  icon: LucideIcon;
  value?: SidebarTab;
};

const platformItems: NavItemConfig[] = [
  { label: "Overview", icon: LayoutDashboard, value: "dashboard" },
  { label: "Knowledge Library", icon: Library },
  { label: "AI Workspace", icon: MessageSquare, value: "chat" },
  { label: "Agent Builder", icon: Bot },
  { label: "Analytics", icon: LineChart },
];

const governanceItems: NavItemConfig[] = [
  { label: "Admin & Roles", icon: Shield },
  { label: "Settings", icon: Settings },
];

export function Sidebar({
  activeTab = "dashboard",
  onTabChange,
  className = "",
  user = {
    initials: "JD",
    name: "Jane Doe",
    role: "Enterprise Admin",
  },
}: SidebarProps) {
  return (
    <aside
      className={[
        "w-64 border-r border-slate-200 dark:border-white/[0.04]",
        "bg-white/70 dark:bg-slate-950/50 backdrop-blur-xl",
        "flex flex-col shadow-sm dark:shadow-none",
        className,
      ].join(" ")}
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

      <div className="flex-1 py-6 px-4 flex flex-col gap-1">
        <SidebarSection title="Platform">
          {platformItems.map((item) => (
            <SidebarNavItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              isActive={item.value === activeTab}
              onClick={() => item.value && onTabChange?.(item.value)}
            />
          ))}
        </SidebarSection>

        <SidebarSection title="Governance" className="mt-8">
          {governanceItems.map((item) => (
            <SidebarNavItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              isActive={false}
            />
          ))}
        </SidebarSection>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-white/[0.04]">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.03] transition-colors cursor-pointer group text-left">
          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-white/10 group-hover:border-slate-300 dark:group-hover:border-white/20 transition-colors">
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
          <MoreHorizontal size={16} className="text-slate-400" />
        </button>
      </div>
    </aside>
  );
}

type SidebarSectionProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

function SidebarSection({ title, children, className = "" }: SidebarSectionProps) {
  return (
    <div className={className}>
      <div className="px-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

type SidebarNavItemProps = {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
};

function SidebarNavItem({
  icon: Icon,
  label,
  isActive = false,
  onClick,
}: SidebarNavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
        isActive
          ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 font-semibold"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.03] hover:text-slate-900 dark:hover:text-slate-200 font-medium"
      }`}
    >
      <div className={isActive ? "opacity-100" : "opacity-70"}>
        <Icon size={18} />
      </div>
      <span className="text-sm tracking-wide">{label}</span>
      {isActive && (
        <div className="ml-auto w-1 h-4 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)] dark:shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
      )}
    </button>
  );
}
