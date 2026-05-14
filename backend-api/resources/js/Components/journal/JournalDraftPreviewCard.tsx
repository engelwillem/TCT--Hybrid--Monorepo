import { Card, CardContent } from '@/Components/ui/card';

type JournalDraftPreview = {
    id: number;
    body: string;
    source_ref: string | null;
    entry_date: string;
};

export default function JournalDraftPreviewCard({
    draft,
}: {
    draft: JournalDraftPreview | null | undefined;
}) {
    if (!draft) return null;

    return (
        <Card className="rounded-3xl bg-surface shadow-soft ring-1 ring-black/5 dark:ring-white/10">
            <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                        Private Journal
                    </p>
                    <span className="rounded-full bg-surface-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                        {draft.entry_date}
                    </span>
                </div>
                {draft.source_ref ? (
                    <p className="mt-2 text-xs font-semibold text-foreground">
                        {draft.source_ref.toUpperCase().replace(/-/g, ' ')}
                    </p>
                ) : null}
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground/90">
                    {draft.body}
                </p>
            </CardContent>
        </Card>
    );
}

