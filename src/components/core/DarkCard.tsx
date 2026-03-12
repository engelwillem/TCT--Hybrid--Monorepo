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
                'rounded-[32px] bg-white/[0.02] p-8 text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] ring-1 ring-white/10 backdrop-blur-md transition-all hover:bg-white/[0.04]',
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
