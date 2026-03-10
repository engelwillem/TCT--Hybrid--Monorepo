import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';

export type DailyVersePost = {
    id: number;
    title: string;
    excerpt?: string | null;
    content?: string | null;
    meta?: {
        book_code?: string | null;
        chapter?: number | string | null;
        verse?: number | string | null;
        quote?: string | null;
        cta_label?: string | null;
        cta_href?: string | null;
    } | null;
} | null;

type Props = {
    dailyVersePost: DailyVersePost;
    compact?: boolean;
};

function buildRef(meta?: DailyVersePost extends null ? any : any) {
    const book = meta?.book_code ?? null;
    const chapter = meta?.chapter ?? null;
    const verse = meta?.verse ?? null;

    if (!book || !chapter || !verse) return null;
    return `${book}.${chapter}.${verse}`;
}

function buildLabelRef(meta?: any) {
    const book = meta?.book_code ?? null;
    const chapter = meta?.chapter ?? null;
    const verse = meta?.verse ?? null;

    if (!book || !chapter || !verse) return null;
    return `${book.toUpperCase()} ${chapter}:${verse}`;
}

export default function DailyVerseCard({ dailyVersePost, compact = false }: Props) {
    const [shared, setShared] = useState<'idle' | 'copied'>('idle');

    const meta = dailyVersePost?.meta ?? undefined;

    const ref = useMemo(() => buildRef(meta), [meta?.book_code, meta?.chapter, meta?.verse]);
    const labelRef = useMemo(() => buildLabelRef(meta), [meta?.book_code, meta?.chapter, meta?.verse]);

    const defaultHref = ref ? `/versehub/${ref}` : '/versehub/id';
    const href = meta?.cta_href?.trim() ? meta.cta_href.trim() : defaultHref;
    const ctaLabel = meta?.cta_label?.trim() ? meta.cta_label.trim() : 'Baca';

    async function handleShare() {
        const shareUrl = ref ? `${window.location.origin}/versehub/${ref}` : `${window.location.origin}/versehub/id`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Daily Verse',
                    text: meta?.quote ?? undefined,
                    url: shareUrl,
                });
                return;
            }

            await navigator.clipboard.writeText(shareUrl);
            setShared('copied');
            window.setTimeout(() => setShared('idle'), 1500);
        } catch {
            // ignore
        }
    }

    if (!dailyVersePost) {
        return (
            <Card className="rounded-3xl bg-surface shadow-soft">
                <CardHeader className="pb-3">
                    <CardTitle className={compact ? 'tct-h3' : 'tct-h2'}>
                        {compact ? 'Daily Verse' : 'VerseHub'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <p className="tct-meta">
                        Daily verse will appear here.
                    </p>
                    <div className="mt-4">
                        <Button
                            onClick={() => window.location.assign('/versehub/id')}
                        >
                            Buka VerseHub
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-3xl bg-surface shadow-soft">
            <CardHeader className={compact ? 'pb-2' : 'pb-3'}>
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <CardTitle className={compact ? 'tct-h3' : 'tct-h2'}>
                            {compact ? 'Daily Verse' : (dailyVersePost.title ?? 'VerseHub')}
                        </CardTitle>
                        {!compact ? (
                            <p className="mt-1 tct-meta">
                                Ayat harian untuk menolong kamu membaca Alkitab.
                            </p>
                        ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleShare}
                        >
                            {shared === 'copied' ? 'Copied' : 'Share'}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <div className={compact ? 'space-y-2' : 'space-y-3'}>
                    {meta?.quote ? (
                        <p className={compact ? 'tct-body' : 'tct-body-lg'}>
                            “{meta.quote}”
                        </p>
                    ) : (
                        <p className="tct-meta">
                            —
                        </p>
                    )}

                    {labelRef ? (
                        <p className="tct-meta">
                            {labelRef}
                        </p>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                        <Button
                            onClick={() => window.location.assign(href)}
                        >
                            {ctaLabel}
                        </Button>
                        {!compact ? (
                            <Button
                                variant="secondary"
                                onClick={() => window.location.assign('/versehub/id')}
                            >
                                Buka Alkitab
                            </Button>
                        ) : null}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
