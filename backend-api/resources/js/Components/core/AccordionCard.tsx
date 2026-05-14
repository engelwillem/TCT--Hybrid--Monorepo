import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { PropsWithChildren, useId, useState } from 'react';

type AccordionCardProps = PropsWithChildren<{
    title: string;
    description?: string;
    defaultOpen?: boolean;
    className?: string;
    headerRight?: ReactNode;
}>;

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
                'rounded-3xl bg-surface-dark text-surface-dark-foreground shadow-card',
                className,
            )}
        >
            <button
                type="button"
                className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls={contentId}
            >
                <div className="min-w-0">
                    <h3 className="text-sm uppercase tracking-wide">{title}</h3>
                    {description ? (
                        <p className="mt-1 text-sm text-white/65">{description}</p>
                    ) : null}
                </div>

                <div className="flex items-center gap-3">
                    {headerRight ?? null}
                    <span
                        className={cn(
                            'mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/70 transition-transform duration-200',
                            open ? 'rotate-180' : 'rotate-0',
                        )}
                        aria-hidden="true"
                    >
                        <svg
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-4 w-4"
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
                    'grid overflow-hidden px-6 transition-[grid-template-rows,opacity] duration-300 ease-out',
                    open ? 'grid-rows-[1fr] pb-6 opacity-100' : 'grid-rows-[0fr] pb-0 opacity-0',
                )}
            >
                <div className="min-h-0">{children}</div>
            </div>
        </div>
    );
}
