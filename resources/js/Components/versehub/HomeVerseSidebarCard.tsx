import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

export type HomeVerse = {
    ref: string;
    href: string;
    text: string;
    reference: string;
};

function VerseQuote({ text }: { text: string }) {
    const lines = String(text ?? '').split(/\r?\n/).map((x) => x.trimEnd());

    return (
        <blockquote className="relative">
            <div className="absolute bottom-1 left-0 top-1 w-px bg-border/60" aria-hidden />

            <div
                className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/60"
                aria-hidden
            >
                <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M10 11H6V7a4 4 0 0 1 4-4"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                    />
                    <path
                        d="M18 11h-4V7a4 4 0 0 1 4-4"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                    />
                    <path
                        d="M10 11v6H6v-6"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M18 11v6h-4v-6"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>

            <div className="pl-6 pr-1">
                <div className="text-[16px] leading-7 tracking-[-0.01em] md:text-[16px] md:leading-7">
                    {lines.map((line, idx) => (
                        <span key={idx}>
                            {line}
                            {idx < lines.length - 1 ? <br /> : null}
                        </span>
                    ))}
                </div>
            </div>
        </blockquote>
    );
}

export default function HomeVerseSidebarCard({ homeVerse }: { homeVerse: HomeVerse | null | undefined }) {
    if (!homeVerse) return null;

    return (
        <a
            href={homeVerse.href}
            className="hidden md:block"
        >
            <Card className="rounded-3xl bg-surface shadow-soft ring-1 ring-black/5 transition hover:bg-surface-muted dark:ring-white/10">
                <CardHeader className="pb-2">
                    <CardTitle className="tct-h3">VerseHub</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <VerseQuote text={homeVerse.text} />
                    <div className="mt-4 text-[13px] font-medium tracking-wider text-muted-foreground">
                        {homeVerse.reference}
                    </div>
                </CardContent>
            </Card>
        </a>
    );
}
