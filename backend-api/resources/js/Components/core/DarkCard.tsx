import { cn } from '@/lib/utils';

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
                'rounded-3xl bg-surface-dark p-6 text-surface-dark-foreground shadow-card',
                className,
            )}
        >
            {title ? <h3 className="text-sm uppercase tracking-wide">{title}</h3> : null}
            <div className="mt-4 space-y-4">{children}</div>
            {actions ? <div className="mt-6">{actions}</div> : null}
        </div>
    );
}