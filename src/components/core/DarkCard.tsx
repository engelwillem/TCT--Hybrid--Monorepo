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
                'rounded-[32px] bg-slate-900 p-8 text-white shadow-2xl ring-1 ring-white/10',
                className,
            )}
        >
            {title ? (
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-6">{title}</h3>
            ) : null}
            <div className="space-y-4">{children}</div>
            {actions ? <div className="mt-8">{actions}</div> : null}
        </div>
    );
}
