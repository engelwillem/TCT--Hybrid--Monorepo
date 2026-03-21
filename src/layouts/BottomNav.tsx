'use client';

import { cn } from '@/lib/utils';
import AppIcon from '@/components/system/AppIcon';
import type { LucideIcon } from 'lucide-react';

type NavItem = {
    id: string;
    icon: LucideIcon;
    label: string;
};

type FloatingBottomNavProps = {
    items: NavItem[];
    activeId: string;
    onChange?: (id: string) => void;
    onPrefetch?: (id: string) => void;
    className?: string;
};

function triggerHaptic() {
    try {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(8);
        }
    } catch {
        // ignore unsupported platform errors
    }
}

export default function FloatingBottomNav({
    items,
    activeId,
    onChange,
    onPrefetch,
    className,
}: FloatingBottomNavProps) {
    if (items.length === 0) return null;

    const gridTemplateColumns =
        items.length > 0 ? `repeat(${items.length}, minmax(0, 1fr))` : undefined;

    return (
        <nav
            aria-label="Primary"
            className={cn(
                // Shell: very clean frosted glass — no grain, no complex multi-shadow
                'relative mx-auto w-full max-w-[392px] rounded-[28px]',
                'border border-black/[0.06] bg-white/80 backdrop-blur-2xl',
                'shadow-[0_16px_40px_-16px_rgba(0,0,0,0.18),0_4px_12px_-6px_rgba(0,0,0,0.06)]',
                'px-1.5 pb-1.5 pt-1',
                className,
            )}
        >
            {/* Top highlight line — single, subtle */}
            <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-90"
            />

            <div
                className="relative z-[1] grid gap-0.5"
                style={gridTemplateColumns ? { gridTemplateColumns } : undefined}
            >
                {items.map((item) => {
                    const isActive = item.id === activeId;

                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                                triggerHaptic();
                                onChange?.(item.id);
                            }}
                            onMouseEnter={() => onPrefetch?.(item.id)}
                            onTouchStart={() => onPrefetch?.(item.id)}
                            className={cn(
                                'relative inline-flex min-h-[60px] flex-col items-center justify-center gap-1',
                                'rounded-2xl px-2 pb-1.5 pt-1.5 transition-all duration-250 ease-out',
                            )}
                            aria-label={item.label}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {/* Active pill background */}
                            {isActive && (
                                <span
                                    aria-hidden="true"
                                    className="absolute inset-0 rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.06]"
                                />
                            )}

                            <AppIcon
                                icon={item.icon}
                                variant="nav"
                                active={isActive}
                                strokeWidth={isActive ? 1.75 : 1.55}
                                className={cn(
                                    'relative z-[1] transition-all duration-250 ease-out',
                                    isActive ? 'text-foreground' : 'text-foreground/40',
                                )}
                            />
                            <span
                                className={cn(
                                    'relative z-[1] text-[10px] font-medium leading-none tracking-[0.01em] transition-colors duration-250',
                                    isActive ? 'text-foreground font-semibold' : 'text-foreground/40',
                                )}
                            >
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
