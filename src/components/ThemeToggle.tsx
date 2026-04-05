"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`w-8 h-8 ${className}`} />;
  }

  const isDark = theme === "dark";
  const nextTheme = isDark ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className={`relative inline-flex items-center justify-center rounded-full border border-black/[0.05] bg-white/72 p-2 text-foreground/55 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.32)] backdrop-blur-xl transition-all hover:bg-white hover:text-foreground active:scale-95 dark:border-white/[0.07] dark:bg-[hsl(240_5%_8%/0.84)] dark:text-foreground/70 dark:shadow-[0_16px_36px_-22px_rgba(0,0,0,0.56)] dark:hover:bg-[hsl(240_5%_10%/0.94)] dark:hover:text-foreground ${className || ''}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </button>
  );
}
