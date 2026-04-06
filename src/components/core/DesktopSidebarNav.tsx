"use client";

import { cn } from '@/lib/utils';
import AppIcon from '@/components/system/AppIcon';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

type NavItem = {
    id: string;
    label: string;
    icon: LucideIcon;
    href?: string;
};

type DesktopSidebarNavProps = {
    activeId?: string;
    className?: string;
    navItems?: NavItem[];
    isAuthenticated?: boolean;
    user?: any;
    appName?: string;
    communityName?: string;
};

export default function DesktopSidebarNav({
    activeId,
    className,
    navItems = [],
    isAuthenticated = false,
    user,
    appName = 'TheChosenTalks',
    communityName = 'Chosen People',
}: DesktopSidebarNavProps) {
    const userName = user?.name ?? '';
    const userEmail = user?.email ?? '';
    const initials = (user?.avatarInitials ?? userName?.slice(0, 1) ?? 'U').toUpperCase();
    const isTodaySidebar = activeId === 'home' || activeId === 'today';

    return (
        <aside
            className={cn(
                'flex flex-col gap-4 rounded-[34px] border border-white/70 bg-white/92 p-6 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.18)] backdrop-blur-xl',
                className,
            )}
            style={{ position: 'sticky', top: '2rem', alignSelf: 'start' }}
        >
            <div>
                <p
                    className={cn(
                        isTodaySidebar
                            ? 'tct-brand-gradient text-base font-bold tracking-tight'
                            : 'text-xs font-medium uppercase tracking-wide text-foreground/40',
                    )}
                >
                    {isTodaySidebar ? 'Choose n Talks' : appName}
                </p>
                {!isTodaySidebar ? (
                    <p className="tct-brand-gradient mt-1 text-lg font-semibold">{communityName}</p>
                ) : null}
            </div>

            <nav className="mt-2 space-y-1">
                {navItems.map((item) => {
                    const isActive = item.id === activeId;
                    const href = item.href ?? '#';

                    const baseClass = cn(
                        'group flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-all duration-200',
                        isActive
                            ? 'bg-[#f3f7fb] text-foreground ring-1 ring-sky-100 shadow-[0_10px_24px_-18px_rgba(14,165,233,0.24)]'
                            : 'text-foreground/55 hover:bg-black/[0.04] hover:text-foreground/80',
                    );

                    return (
                        <Link
                            key={item.id}
                            href={href}
                            className={baseClass}
                        >
                            <AppIcon
                                icon={item.icon}
                                variant="nav"
                                active={isActive}
                                className={cn(
                                    isActive
                                        ? 'text-foreground'
                                        : 'text-foreground/45 group-hover:text-foreground/75',
                                )}
                            />
                            <span className="flex-1">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {isAuthenticated ? (
                <div className="mt-auto flex items-center gap-3 rounded-[24px] bg-[#f8fbff] p-3 ring-1 ring-black/[0.04]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-foreground/75 ring-1 ring-sky-100">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground/85">
                            {userName}
                        </p>
                        <p className="truncate text-xs text-foreground/45">
                            {userEmail}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="mt-auto flex items-center gap-3 rounded-[24px] bg-[#f8fbff] p-3 ring-1 ring-black/[0.04]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-foreground/75 ring-1 ring-sky-100">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground/85">
                            Guest
                        </p>
                        <p className="truncate text-xs text-foreground/45">
                            {communityName}
                        </p>
                    </div>
                </div>
            )}
        </aside>
    );
}
