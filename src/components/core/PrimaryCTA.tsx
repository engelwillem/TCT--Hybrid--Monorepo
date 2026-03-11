import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import React from 'react';

type PrimaryCTAProps = {
    label: string;
    icon?: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    onClick?: () => void;
};

export default function PrimaryCTA({
    label,
    icon,
    className,
    size = 'lg',
    disabled,
    type = 'submit',
    onClick
}: PrimaryCTAProps) {
    const sizes: Record<NonNullable<typeof size>, string> = {
        sm: 'h-10 px-5 text-sm',
        md: 'h-12 px-6 text-[15px]',
        lg: 'h-14 px-8 text-base',
    };

    return (
        <Button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={cn(
                'w-full rounded-full bg-cyan-400 font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:bg-white hover:text-slate-950 active:scale-[0.98] disabled:opacity-50 disabled:grayscale',
                sizes[size],
                className,
            )}
        >
            {icon ? <span className="mr-2 inline-flex">{icon}</span> : null}
            {label}
        </Button>
    );
}
