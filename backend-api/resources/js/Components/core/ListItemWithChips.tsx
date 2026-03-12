import { cn } from '@/lib/utils';

type ListItemWithChipsProps = {
    avatarUrl?: string;
    title: string;
    subtitle?: string;
    chip?: string;
    status?: string;
    meta?: string;
    trailing?: React.ReactNode;
    className?: string;
};

export default function ListItemWithChips({
    avatarUrl,
    title,
    subtitle,
    chip,
    status,
    meta,
    trailing,
    className,
}: ListItemWithChipsProps) {
    return (
        <div
            className={cn(
                'flex items-center justify-between gap-4 rounded-2xl bg-surface px-4 py-3 shadow-soft',
                className,
            )}
        >
            <div className="flex items-center gap-3">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={title}
                        className="h-12 w-12 rounded-full object-cover"
                    />
                ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-sm font-semibold">
                        {title
                            .split(' ')
                            .map((word) => word[0])
                            .join('')}
                    </div>
                )}
                <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    {subtitle ? (
                        <p className="text-xs text-muted-foreground">
                            {subtitle}
                        </p>
                    ) : null}
                    {chip ? (
                        <span className="mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium chip">
                            {chip}
                        </span>
                    ) : null}
                </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
                {status ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium">
                        <span className="h-2 w-2 rounded-full bg-brand" />
                        {status}
                    </span>
                ) : null}
                {meta ? <div className="mt-2">{meta}</div> : null}
                {trailing ? <div className="mt-2">{trailing}</div> : null}
            </div>
        </div>
    );
}