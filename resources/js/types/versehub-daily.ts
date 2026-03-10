export type DailyVerse = {
    ref: string;
    book_code: string;
    chapter: number;
    verse: number;
    quote: string | null;
    cta_label: string;
    cta_href: string;
    source_post_id?: number;
    reference?: string;
    title?: string;
} | null;
