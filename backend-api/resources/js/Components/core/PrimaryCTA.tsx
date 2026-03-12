import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';

type PrimaryCTAProps = {
    label: string;
    icon?: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
};

export default function PrimaryCTA({
    label,
    icon,
    className,
    size = 'lg',
    disabled,
    type = 'submit',
}: PrimaryCTAProps) {
    const sizes: Record<typeof size, string> = {
        sm: 'h-10 px-4 text-sm',
        md: 'h-12 px-5 text-base',
        lg: 'h-14 px-6 text-base',
    };

    return (
        <Button
            type={type}
            disabled={disabled}
            className={cn(
                // NOTE:
                // `Button` (shadcn) default variant adds `hover:bg-primary/90`.
                // When we override base bg/text with `bg-brand text-brand-foreground`,
                // the default hover background could turn dark while the text stays dark,
                // making the label unreadable.
                //
                // We explicitly set hover to a dark surface + neo-blue text so the label
                // stays visible and feels consistent across pages.
                'w-full rounded-full bg-brand text-sm font-semibold text-brand-foreground shadow-soft transition-colors hover:bg-surface-dark hover:text-brand active:bg-surface-dark',
                sizes[size],
                className,
            )}
        >
            {icon ? <span className="mr-2 inline-flex">{icon}</span> : null}
            {label}
        </Button>
    );
}