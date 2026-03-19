import { cn } from '@/lib/utils';
import React from 'react';

type DarkCardProps = {
    title?: string;
    children: React.ReactNode;
    className?: string;
    actions?: React.ReactNode;
};

export default function DarkCard({
    title,
    children,
    className,
    actions,
}: DarkCardProps) {
    return (
        <div
            className={cn(
                'rounded-[32px] bg-surface p-8 text-foreground shadow-card ring-1 ring-border/60 backdrop-blur-md transition-all hover:bg-surface-elevated',
                className,
            )}
        >
            {title ? (
                <h3 className="mb-6 text-sm font-bold uppercase tracking-[0.2em] text-foreground/80">{title}</h3>
            ) : null}
            <div className="space-y-4">{children}</div>
            {actions ? <div className="mt-8">{actions}</div> : null}
        </div>
    );
}
