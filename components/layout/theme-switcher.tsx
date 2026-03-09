"use client";

import React, { useState } from "react";
import { Sun, Moon } from "lucide-react";

export interface ThemeSwitcherProps {
  /** Current mode (controlled). If not set, uses current state. */
  value?: "light" | "dark" | null;
  /** Called when user toggles theme. */
  onThemeChange?: (mode: "light" | "dark") => void;
  /** Ignored - kept for API compatibility. */
  variant?: "default" | "compact";
  className?: string;
}

export function ThemeSwitcher({
  value: valueProp,
  onThemeChange,
  className,
}: ThemeSwitcherProps) {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false
  );

  const value = valueProp ?? (isDark ? "dark" : "light");
  const isCurrentlyDark = value === "dark";

  const handleToggle = () => {
    const nextDark = !isCurrentlyDark;
    if (valueProp == null) {
      setIsDark(nextDark);
    }
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", nextDark);
    }
    onThemeChange?.(nextDark ? "dark" : "light");
  };

  return (
    <div
      className={`flex items-center gap-2 ${className ?? ""}`}
      role="group"
      aria-label="Theme toggle"
    >
      <span
        className={`text-xs font-medium transition-colors ${
          !isCurrentlyDark
            ? "text-slate-900 dark:text-white"
            : "text-slate-500 dark:text-slate-400"
        }`}
      >
        Light
      </span>

      <button
        type="button"
        onClick={handleToggle}
        role="switch"
        aria-checked={isCurrentlyDark}
        aria-label={isCurrentlyDark ? "Switch to light mode" : "Switch to dark mode"}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
          isCurrentlyDark
            ? "bg-slate-800"
            : "bg-indigo-400"
        }`}
      >
        <span
          className={`pointer-events-none flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow-sm ring-0 transition-transform ${
            isCurrentlyDark ? "translate-x-6" : "translate-x-0.5"
          }`}
        >
          {isCurrentlyDark ? (
            <Moon className="h-3 w-3 text-slate-800" />
          ) : (
            <Sun className="h-3 w-3 text-indigo-600" />
          )}
        </span>
      </button>

      <span
        className={`text-xs font-medium transition-colors ${
          isCurrentlyDark
            ? "text-white dark:text-slate-100"
            : "text-slate-500 dark:text-slate-400"
        }`}
      >
        Dark
      </span>
    </div>
  );
}
