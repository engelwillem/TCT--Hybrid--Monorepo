"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, BookOpen, Inbox, User, Hash } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Today", icon: Home, href: "/today" },
  { label: "Community", icon: Users, href: "/community" },
  { label: "Channels", icon: Hash, href: "/channels" },
  { label: "VerseHub", icon: BookOpen, href: "/versehub/en" },
  { label: "Inbox", icon: Inbox, href: "/inbox" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-16 bottom-nav-blur border-t border-border z-50 flex items-center justify-around px-2 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href.split('/').slice(0, 2).join('/'))
        const Icon = item.icon
        
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200",
              isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "p-1.5 rounded-xl transition-all duration-300",
              isActive ? "bg-primary/10" : ""
            )}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-tighter leading-none">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
