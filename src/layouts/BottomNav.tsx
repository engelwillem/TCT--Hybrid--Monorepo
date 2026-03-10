
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Grid2x2, Users, BookOpenText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const navItems = [
  { label: "Home", icon: House, href: "/today" },
  { label: "Channels", icon: Grid2x2, href: "/channels" },
  { label: "Community", icon: Users, href: "/community" },
  { label: "Bible", icon: BookOpenText, href: "/versehub/id" },
  { label: "Settings", icon: Settings, href: "/profile" },
];

export function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-[calc(100%-40px)] max-w-sm z-50">
      <nav className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand/20 to-accent/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-700" />

        <div className="relative glass-nav border border-white/40 dark:border-white/10 rounded-[2.5rem] h-18 px-3 flex items-center justify-around shadow-premium">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-1.5 transition-all duration-500 relative py-1",
                  isActive ? "text-brand" : "text-muted-foreground/60 hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-pill"
                    className="absolute inset-x-1 inset-y-2 bg-brand/5 dark:bg-brand/10 rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
                  />
                )}

                <div className={cn(
                  "relative transition-all duration-500 group-active:scale-90 flex flex-col items-center",
                  isActive ? "scale-110 -translate-y-0.5" : "scale-100"
                )}>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 w-1 h-1 bg-brand rounded-full shadow-[0_0_8px_hsl(var(--brand)/0.8)]"
                    />
                  )}
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className="transition-all" />
                </div>

                <span className={cn(
                  "text-[8px] font-black uppercase tracking-[0.15em] leading-none transition-all duration-500",
                  isActive ? "opacity-100 translate-y-0" : "opacity-40 translate-y-0.5"
                )}>
                  {item.label}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="active-line"
                    className="absolute bottom-1 w-4 h-0.5 bg-brand rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
