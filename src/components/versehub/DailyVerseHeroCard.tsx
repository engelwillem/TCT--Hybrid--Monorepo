'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bookmark, Share2, Book } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { DailyVerse } from '@/types/versehub-daily';
import { getVerseShareUrl } from '@/lib/share';
import { prepareVersehubShareAsset } from '@/lib/share-assets';

const isIos = () => typeof navigator !== 'undefined' && /iP(hone|od|ad)/.test(navigator.userAgent || '');

export default function DailyVerseHeroCard({
    welcomeVerse,
    fallbackVerse,
}: {
    welcomeVerse?: DailyVerse;
    fallbackVerse?: DailyVerse;
}) {
    const verse = fallbackVerse ?? welcomeVerse ?? null;

    const heroRefHref = useMemo(() => {
        const raw = String(verse?.cta_href || '').trim();
        if (!raw) {
            return verse?.ref ? `/versehub/en?ref=${encodeURIComponent(verse.ref)}` : '/versehub/en';
        }
        const chapterFixed = raw.replace('/chapter/', '/');
        const withOrigin = chapterFixed.startsWith('http')
            ? chapterFixed
            : `https://www.thechoosentalks.org${chapterFixed.startsWith('/') ? '' : '/'}${chapterFixed}`;
        try {
            const url = new URL(withOrigin);
            const parts = url.pathname.split('/').filter(Boolean);
            if (parts[0] === 'versehub' && parts[1] && parts[2]) {
                return `/versehub/${parts[1]}?ref=${encodeURIComponent(parts.slice(2).join('/'))}`;
            }
            if (parts[0] === 'versehub' && parts[1]) {
                return `/versehub/${parts[1]}`;
            }
            return chapterFixed;
        } catch {
            return chapterFixed;
        }
    }, [verse?.cta_href, verse?.ref]);
    const heroRefLabel = verse?.reference ?? 'Today’s Verse';
    const heroQuote = verse?.quote?.trim() || 'Today’s scripture is being prepared.';
    const heroCtaLabel = verse?.cta_label?.trim() || 'Read the Bible';
    
    // Safety check for window.location in SSR
    const [origin, setOrigin] = useState('');
    useEffect(() => {
        setOrigin(window.location.origin);
    }, []);
    
    const canonicalUrl = verse?.ref ? getVerseShareUrl('id', verse.ref) : `${origin}${heroRefHref}`;
    const quoteHeadline = heroQuote;
    const quoteSubline = 'Stay strong, keep hope alive, and keep walking with God.';
    const refLine = `${heroRefLabel} • Today’s verse`;

    const reactionKey = useMemo(
        () => `tct:today:welcome-verse:${verse?.ref ?? 'none'}`,
        [verse?.ref],
    );

    const [saved, setSaved] = useState(false);
    const [isRevealed, setIsRevealed] = useState(false);
    const [reduceMotion, setReduceMotion] = useState(false);
    const cardRef = useRef<HTMLDivElement | null>(null);
    const parallaxRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(reactionKey);
            const parsed = raw ? JSON.parse(raw) : null;
            setSaved(Boolean(parsed?.saved));
        } catch {
            setSaved(false);
        }
    }, [reactionKey]);

    useEffect(() => {
        try {
            window.localStorage.setItem(
                reactionKey,
                JSON.stringify({
                    saved,
                    updated_at: new Date().toISOString(),
                }),
            );
        } catch {
            // ignore
        }
    }, [reactionKey, saved]);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return;
        }
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        const apply = () => {
            const isReduce = media.matches;
            setReduceMotion(isReduce);
            if (isReduce) setIsRevealed(true);
        };
        apply();
        media.addEventListener('change', apply);
        return () => media.removeEventListener('change', apply);
    }, []);

    useEffect(() => {
        if (reduceMotion) return;
        const card = cardRef.current;
        if (!card || typeof IntersectionObserver === 'undefined') return;
        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (!first) return;
                if (first.isIntersecting && first.intersectionRatio >= 0.35) {
                    setIsRevealed(true);
                    observer.disconnect();
                }
            },
            { threshold: [0, 0.35, 0.6] },
        );
        observer.observe(card);
        return () => observer.disconnect();
    }, [reduceMotion]);

    useEffect(() => {
        if (reduceMotion) {
            if (parallaxRef.current) {
                parallaxRef.current.style.transform = 'translate3d(0,0,0)';
            }
            return;
        }

        const card = cardRef.current;
        const parallax = parallaxRef.current;
        if (!card || !parallax) return;

        let rafId = 0;
        let ticking = false;
        let maxY = window.innerWidth >= 768 ? 14 : 10;
        let maxX = window.innerWidth >= 768 ? 6 : 0;

        const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
        const recalcBounds = () => {
            const isDesktop = window.innerWidth >= 768;
            maxY = isDesktop ? 14 : 10;
            maxX = isDesktop ? 6 : 0;
        };

        const update = () => {
            ticking = false;
            const rect = card.getBoundingClientRect();
            const viewportH = window.innerHeight || 1;
            if (rect.bottom < -200 || rect.top > viewportH + 200) return;
            const center = rect.top + rect.height / 2;
            const progress = clamp((center - viewportH / 2) / (viewportH / 2), -1, 1);
            const y = -progress * maxY;
            const x = -progress * maxX;
            parallax.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
        };

        const requestTick = () => {
            if (ticking) return;
            ticking = true;
            rafId = window.requestAnimationFrame(update);
        };

        const onResize = () => {
            recalcBounds();
            requestTick();
        };

        recalcBounds();
        requestTick();
        window.addEventListener('scroll', requestTick, { passive: true });
        window.addEventListener('resize', onResize, { passive: true });

        return () => {
            window.removeEventListener('scroll', requestTick);
            window.removeEventListener('resize', onResize);
            if (rafId) window.cancelAnimationFrame(rafId);
        };
    }, [reduceMotion]);

    const revealMotionClass = reduceMotion
        ? ''
        : 'transition-[opacity,transform,filter] duration-300 ease-out will-change-[opacity,transform,filter]';
    const revealClass = (_index: number) => {
        if (reduceMotion) return '';
        const stateClass = isRevealed ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-[6px] blur-[1px]';
        return `${revealMotionClass} ${stateClass}`;
    };
    const revealStyle = (index: number) =>
        reduceMotion
            ? undefined
            : ({
                transitionDelay: `${index * 55}ms`,
            } as const);

    const shareVerse = async () => {
        const shareTitle = `${heroRefLabel} • VerseHub`;
        let preparedUrl = canonicalUrl;
        if (verse?.ref) {
            try {
                const preparePromise = prepareVersehubShareAsset('id', verse.ref);
                const timeoutPromise = new Promise<null>((resolve) => window.setTimeout(() => resolve(null), 1500));
                const prepared = await Promise.race([preparePromise, timeoutPromise]);
                if (prepared?.shareUrl) {
                    preparedUrl = prepared.shareUrl;
                }
            } catch {
                // non-fatal
            }
        }
        try {
            if (navigator.share) {
                await navigator.share({
                    title: shareTitle,
                    text: heroQuote,
                    url: preparedUrl,
                });
                return;
            }

            const waUrl = `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${preparedUrl}`)}`;
            if (isIos()) {
                window.location.assign(waUrl);
                return;
            }
            window.open(waUrl, '_blank', 'noopener,noreferrer');
        } catch {
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(preparedUrl);
                    return;
                }
                const ta = document.createElement('textarea');
                ta.value = preparedUrl;
                ta.setAttribute('readonly', '');
                ta.style.position = 'fixed';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                ta.remove();
            } catch {
                // ignore
            }
        }
    };

    return (
        <Card
            ref={cardRef}
            className="
                relative overflow-hidden
                rounded-[32px] md:rounded-[40px] border-0 tct-card-pad
                glass-card
            "
        >
            {/* Artistic Decorative Background */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-300 blur-[80px]" />
                <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-300 blur-[80px]" />
            </div>

            <div className="pointer-events-none absolute inset-0 bg-surface/40 backdrop-blur-[1px]" />
            <div
                ref={parallaxRef}
                className="pointer-events-none absolute inset-0 will-change-transform"
                style={{ transform: 'translate3d(0,0,0)' }}
            >
                <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(70%_80%_at_50%_0%,rgba(255,255,255,0.65),rgba(255,255,255,0))]" />
            </div>

            <CardHeader className="relative z-10 p-0">
                <div className="flex justify-center">
                    <div
                        className={`
                            mx-auto inline-flex items-center gap-2
                            rounded-full bg-surface-elevated/80 px-4 py-2
                            text-xs font-semibold text-foreground
                            ring-1 ring-border/50 backdrop-blur-xl
                            ${revealClass(0)}
                        `}
                        style={revealStyle(0)}
                    >
                        <CardTitle className="inline-flex items-center text-xs font-semibold text-foreground"><Book className="h-4 w-4 mr-1.5 text-brand" /> My Strength Verse</CardTitle>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="relative z-10 p-0">
                <p
                    className={`mt-5 text-center text-[26px] leading-[1.22] font-serif font-semibold tracking-[0.005em] text-foreground line-clamp-3 md:text-[36px] md:leading-[1.15] md:tracking-[0.01em] ${revealClass(1)}`}
                    style={revealStyle(1)}
                >
                    {quoteHeadline}
                </p>
                <p
                    className={`mt-3 text-center text-sm leading-relaxed text-muted-foreground line-clamp-2 md:mt-4 md:text-base ${revealClass(2)}`}
                    style={revealStyle(2)}
                >
                    {quoteSubline}
                </p>

                <div className={`mt-4 text-center md:mt-5 ${revealClass(3)}`} style={revealStyle(3)}>
                    <p className="tct-kicker">
                        {refLine}
                    </p>
                </div>

                <div className="mt-5 md:mt-6">
                    <button
                        type="button"
                        onClick={() => typeof window !== 'undefined' && window.location.assign(heroRefHref)}
                        className={`
                            group tct-pressable relative inline-flex h-12 w-full items-center justify-center rounded-full overflow-hidden
                            bg-brand
                            text-background text-sm font-bold
                            shadow-card
                            hover:brightness-[1.05] hover:shadow-premium
                            active:translate-y-[1px]
                            transition-all duration-300 ease-out motion-reduce:transition-none
                            ${revealClass(4)}
                        `}
                        style={revealStyle(4)}
                    >
                        <span className="pointer-events-none absolute inset-0 opacity-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)] transition-opacity duration-150 ease-out group-active:opacity-100 motion-reduce:transition-none" />
                        {heroCtaLabel}
                    </button>
                </div>

                <div className={`mt-4 flex items-center justify-between md:mt-5 ${revealClass(6)}`} style={revealStyle(6)}>
                    <p className="tct-kicker">Share or save</p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="
                                group tct-pressable relative inline-flex items-center gap-2 rounded-full overflow-hidden
                                border border-border/50 bg-surface-elevated/70 px-4 py-2
                                text-xs font-semibold text-foreground
                                backdrop-blur-xl shadow-soft
                                hover:bg-surface-elevated
                                transition-all duration-300 ease-out motion-reduce:transition-none
                            "
                            aria-label="Share"
                            onClick={shareVerse}
                        >
                            <span className="pointer-events-none absolute inset-0 opacity-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)] transition-opacity duration-150 ease-out group-active:opacity-100 motion-reduce:transition-none" />
                            <Share2 className="h-3.5 w-3.5" />
                            Share
                        </button>

                        <button
                            type="button"
                            className={`group tct-pressable relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold border border-border/50 backdrop-blur-xl shadow-soft transition-all duration-300 ease-out motion-reduce:transition-none overflow-hidden ${saved ? 'bg-brand text-background' : 'bg-surface-elevated/70 text-foreground hover:bg-surface-elevated'
                                }`}
                            aria-label="Save"
                            aria-pressed={saved}
                            onClick={() => setSaved((v) => !v)}
                        >
                            <span className="pointer-events-none absolute inset-0 opacity-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)] transition-opacity duration-150 ease-out group-active:opacity-100 motion-reduce:transition-none" />
                            <Bookmark className="h-3.5 w-3.5" fill={saved ? 'currentColor' : 'none'} />
                            Save
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
