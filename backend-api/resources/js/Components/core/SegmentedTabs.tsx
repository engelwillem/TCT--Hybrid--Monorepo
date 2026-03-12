import { cn } from '@/lib/utils';

type TabOption = {
    id: string;
    label: string;
};

type SegmentedTabsProps = {
    options: TabOption[];
    activeId: string;
    onChange?: (id: string) => void;
    className?: string;
};

export default function SegmentedTabs({
    options,
    activeId,
    onChange,
    className,
}: SegmentedTabsProps) {
    return (
        <div
            className={cn(
                'flex items-center rounded-full bg-surface-muted p-1 text-sm shadow-soft outline outline-1 outline-transparent',
                className,
            )}
        >
            {options.map((option) => {
                const isActive = option.id === activeId;
                return (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => onChange?.(option.id)}
                        className={cn(
                            'flex-1 rounded-full px-4 py-2 text-sm font-medium transition',
                            isActive
                                ? 'bg-surface-dark text-brand shadow-soft'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}