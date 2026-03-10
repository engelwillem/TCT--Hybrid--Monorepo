import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

type AppIconVariant = 'nav' | 'action' | 'ui';

type AppIconProps = {
    icon: LucideIcon;
    variant?: AppIconVariant;
    size?: number;
    className?: string;
    strokeWidth?: number;
    active?: boolean;
};

const DEFAULT_SIZE: Record<AppIconVariant, number> = {
    nav: 22,
    action: 20,
    ui: 18,
};

export default function AppIcon({
    icon: Icon,
    variant = 'ui',
    size,
    className,
    strokeWidth = 1.5,
    active = false,
}: AppIconProps) {
    return (
        <Icon
            size={size ?? DEFAULT_SIZE[variant]}
            strokeWidth={strokeWidth}
            className={cn(
                'shrink-0 align-middle transition-colors duration-200',
                active ? 'text-foreground' : '',
                className,
            )}
            aria-hidden
        />
    );
}

export type { AppIconProps, AppIconVariant };

