
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Grid2x2, Users, BookOpenText, Settings, Sparkles, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Home", icon: House, href: "/today" },
  { label: "Channels", icon: Grid2x2, href: "/channels" },
  { label: "Community", icon: Users, href: "/community" },
  { label: "Bible", icon: BookOpenText, href: "/versehub/id" },
  { label: "Settings", icon: Settings, href: "/profile" },
];

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 bg-card border-r border-border/50 z-50 p-8 space-y-10 shadow-xl">
      <div className="flex items-center gap-3 px-2">
        <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand/30">
          <Sparkles size={26} />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-black tracking-tighter leading-none">TheChosen</h1>
          <span className="tct-label text-[10px] opacity-60">Talks • Premium</span>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        <p className="tct-label px-4 mb-4">Main Menu</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative",
                isActive 
                  ? "text-brand bg-brand/5 font-extrabold shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={cn(isActive && "scale-110 transition-transform")} />
              <span className="text-sm font-bold tracking-tight">{item.label}</span>
              
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute left-0 w-1.5 h-8 bg-brand rounded-r-full shadow-[2px_0_8px_rgba(var(--brand),0.4)]"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-6">
        <div className="p-6 bg-muted/40 rounded-3xl space-y-4 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand text-sm font-black ring-2 ring-brand/5">
              TC
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-extrabold truncate">Chosen User</span>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Premium Member</span>
            </div>
          </div>
          <div className="flex gap-2">
             <Button variant="ghost" size="icon" className="flex-1 h-10 rounded-xl hover:bg-muted bg-background">
               <Settings size={18} className="text-muted-foreground" />
             </Button>
             <Button variant="ghost" size="icon" className="flex-1 h-10 rounded-xl hover:bg-destructive/10 text-destructive bg-background">
               <LogOut size={18} />
             </Button>
          </div>
        </div>
        <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] text-center">
          v1.0.42 • STABLE
        </p>
      </div>
    </aside>
  );
}
