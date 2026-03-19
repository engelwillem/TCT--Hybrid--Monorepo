"use client";

import { cn } from '@/lib/utils';
import React, { ReactNode, useId, useState } from 'react';

type AccordionCardProps = {
    title: string;
    description?: string;
    defaultOpen?: boolean;
    className?: string;
    headerRight?: ReactNode;
    children: ReactNode;
};

export default function AccordionCard({
    title,
    description,
    defaultOpen = false,
    className,
    headerRight,
    children,
}: AccordionCardProps) {
    const [open, setOpen] = useState(defaultOpen);
    const contentId = useId();

    return (
        <div
            className={cn(
                'overflow-hidden rounded-[32px] bg-surface text-foreground shadow-card ring-1 ring-border/60 backdrop-blur-md transition-all hover:ring-border',
                className,
            )}
        >
            <button
                type="button"
                className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-surface-muted/70"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls={contentId}
            >
                <div className="min-w-0">
                    <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-foreground">{title}</h3>
                    {description ? (
                        <p className="mt-1 text-xs font-medium text-muted-foreground">{description}</p>
                    ) : null}
                </div>

                <div className="flex items-center gap-3">
                    {headerRight ?? null}
                    <span
                        className={cn(
                            'mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted ring-1 ring-border/60 text-muted-foreground transition-all duration-300 hover:bg-surface-elevated hover:text-foreground',
                            open ? 'rotate-180' : 'rotate-0',
                        )}
                        aria-hidden="true"
                    >
                        <svg
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-5 w-5"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.24 4.5a.75.75 0 0 1-1.08 0l-4.24-4.5a.75.75 0 0 1 .02-1.06Z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </span>
                </div>
            </button>

            <div
                id={contentId}
                className={cn(
                    'grid overflow-hidden px-6 transition-[grid-template-rows,opacity,padding] duration-300 ease-out',
                    open ? 'grid-rows-[1fr] pb-6 opacity-100' : 'grid-rows-[0fr] pb-0 opacity-0',
                )}
            >
                <div className="min-h-0">{children}</div>
            </div>
        </div>
    );
}
