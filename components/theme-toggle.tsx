// components/theme-toggle.tsx
"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggle}
      className="w-9 h-9 rounded-full flex items-center justify-center
                 text-slate-500 hover:text-amber-500
                 hover:bg-amber-50 dark:hover:bg-amber-500/10
                 transition-colors"
      title="Toggle theme"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}