'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import AppIcon from '@/components/system/AppIcon';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { TCTLogo } from '@/components/brand/TCTLogo';
import { useCurrentUserAvatarStyle } from '@/lib/avatar-presentation';

type NavItem = {
    id: string;
    label: string;
    icon: LucideIcon;
    href?: string;
};

type DesktopSidebarNavProps = {
    activeId?: string;
    navItems: NavItem[];
    isAuthenticated: boolean;
    userName?: string;
    userEmail?: string;
    initials?: string;
    avatarUrl?: string | null;
    isGuest?: boolean;
    appName?: string;
    communityName?: string;
    className?: string;
};

const ROUTE_MAP: Record<string, string> = {
    today: '/renungan',
    versehub: '/versehub/id',
    community: '/community',
    profile: '/profile',
};

const API_BASE_FALLBACK = 'https://api.thechoosentalks.org';

function resolveApiOrigin(): string {
    const raw =
        process.env.NEXT_PUBLIC_LARAVEL_API_BASE_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        API_BASE_FALLBACK;
    try {
        return new URL(raw).origin;
    } catch {
        return API_BASE_FALLBACK;
    }
}

function extractKnownAvatarPath(pathname: string): string | null {
    if (!pathname) return null;
    const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
    if (normalizedPath.startsWith('/storage/') || normalizedPath.startsWith('/api/v1/avatar/')) {
        return normalizedPath;
    }

    const storageMarker = normalizedPath.indexOf('/storage/');
    if (storageMarker >= 0) {
        return normalizedPath.slice(storageMarker);
    }

    const avatarMarker = normalizedPath.indexOf('/api/v1/avatar/');
    if (avatarMarker >= 0) {
        return normalizedPath.slice(avatarMarker);
    }

    return null;
}

function normalizeSidebarAvatarUrl(value?: string | null): string | null {
    const raw = String(value || '').trim();
    if (!raw) return null;
    if (raw.startsWith('blob:') || raw.startsWith('data:image/')) return raw;

    const apiOrigin = resolveApiOrigin();

    try {
        const parsed = new URL(raw);
        const knownPath = extractKnownAvatarPath(parsed.pathname);
        if (knownPath) {
            return `${apiOrigin}${knownPath}${parsed.search}${parsed.hash}`;
        }
        return parsed.toString();
    } catch {
        const normalized = raw.startsWith('/') ? raw : `/${raw.replace(/^\/+/, '')}`;
        const knownPath = extractKnownAvatarPath(normalized);
        if (knownPath) {
            return `${apiOrigin}${knownPath}`;
        }
        return normalized;
    }
}

export default function DesktopSidebarNav({
    activeId,
    navItems,
    isAuthenticated,
    userName,
    userEmail,
    initials,
    avatarUrl,
    isGuest = false,
    className,
}: DesktopSidebarNavProps) {
    const resolvedName = userName?.trim() || 'Guest';
    const resolvedInitials = (initials?.trim() || (isGuest ? 'G' : resolvedName.slice(0, 1) || 'U')).toUpperCase();
    const resolvedAvatarUrl = useMemo(
        () => (isGuest ? null : normalizeSidebarAvatarUrl(avatarUrl)),
        [avatarUrl, isGuest]
    );
    const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
    const avatarPresentation = useCurrentUserAvatarStyle(
        resolvedAvatarUrl,
        { name: resolvedName },
        32,
    );

    useEffect(() => {
        setAvatarLoadFailed(false);
    }, [resolvedAvatarUrl]);

    return (
        <aside
            className={cn(
                'flex flex-col gap-2 rounded-[34px] p-5',
                'bg-white/92 backdrop-blur-xl',
                'border border-white/70 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.18)]',
                className,
            )}
            style={{ position: 'sticky', top: '2rem', alignSelf: 'start' }}
        >
            {/* Brand — quiet, elegant, with SVG logo */}
            <div className="flex items-center gap-2.5 px-3 mb-4 mt-1 opacity-90 transition-opacity hover:opacity-100">
                <TCTLogo className="w-5 h-5 drop-shadow-sm" />
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-foreground/45 mt-0.5">
                    The Chosen Talks
                </p>
            </div>

            <nav className="space-y-0.5">
                {navItems.map((item) => {
                    const isActive = item.id === activeId;
                    const href = item.href || ROUTE_MAP[item.id] || '/';

                    return (
                        <Link
                            key={item.id}
                            href={href}
                            className={cn(
                                'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[14px] font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-[#f3f7fb] text-foreground ring-1 ring-sky-100 shadow-[0_10px_24px_-18px_rgba(14,165,233,0.24)]'
                                    : 'text-foreground/45 hover:text-foreground/80 hover:bg-black/[0.025]',
                            )}
                        >
                            <AppIcon
                                icon={item.icon}
                                variant="nav"
                                active={isActive}
                                className={cn(
                                    'transition-opacity',
                                    isActive ? 'opacity-100' : 'opacity-50 group-hover:opacity-75',
                                )}
                            />
                            <span className="flex-1">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-4 border-t border-black/[0.04] pt-4">
                <div className="flex items-center gap-3 px-2">
                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#f8fbff] text-[12px] font-semibold text-foreground/70 ring-1 ring-sky-100">
                        {resolvedAvatarUrl && !avatarLoadFailed ? (
                            <img
                                src={resolvedAvatarUrl}
                                alt={resolvedName}
                                className={cn('h-full w-full object-cover', avatarPresentation.className)}
                                style={avatarPresentation.style}
                                onError={() => setAvatarLoadFailed(true)}
                            />
                        ) : (
                            resolvedInitials
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-foreground/80">
                            {resolvedName}
                        </p>
                        <p className="truncate text-[11px] text-foreground/35">
                            {isGuest ? 'Chosen People' : (userEmail || 'Chosen People')}
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
