'use client';

import React, { useEffect, useMemo, useState, use } from 'react';
import { useAuthSession } from '@/auth/use-auth-session';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Lock, Share2 } from 'lucide-react';
import { buildAppAuthHeaders, fetchWithAppAuth } from '@/lib/app-auth-fetch';

type ReflectionItem = {
    id: string | number;
    verse_ref: string;
    question_text: string;
    answer_text: string;
    is_private: boolean;
    created_at: string;
};

type ReflectionsApiResponse = {
    data?: {
        items?: ReflectionItem[];
    };
    message?: string;
};

function formatDate(raw: string, lang: string) {
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export default function ReflectionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const searchParams = useSearchParams();
    const router = useRouter();
    const { isAuthenticated, isRestoring } = useAuthSession();
    const lang = searchParams.get('lang') || 'id';
    const isId = lang === 'id';

    const [loading, setLoading] = useState(true);
    const [authRequired, setAuthRequired] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [reflection, setReflection] = useState<ReflectionItem | null>(null);

    useEffect(() => {
        let active = true;

        const loadDetail = async () => {
            if (isRestoring) {
                return;
            }

            if (!isAuthenticated) {
                if (!active) return;
                setAuthRequired(true);
                setLoading(false);
                return;
            }

            try {
                const response = await fetchWithAppAuth(`/api/versehub/${lang}/reflections`, {
                    headers: buildAppAuthHeaders(),
                    cache: 'no-store',
                });

                if (!active) return;

                if (response.status === 401 || response.status === 403) {
                    setAuthRequired(true);
                    return;
                }

                if (!response.ok) {
                    const payload = (await response.json().catch(() => ({}))) as ReflectionsApiResponse;
                    setErrorMessage(payload?.message || (isId ? 'Gagal memuat detail refleksi.' : 'Failed to load reflection detail.'));
                    return;
                }

                const payload = (await response.json()) as ReflectionsApiResponse;
                const items = Array.isArray(payload?.data?.items) ? payload.data.items : [];
                const found =
                    items.find((item) => String(item.id) === slug) ||
                    items.find((item) => item.verse_ref === slug) ||
                    null;

                setReflection(found);
            } catch {
                if (!active) return;
                setErrorMessage(isId ? 'Tidak dapat terhubung ke server refleksi.' : 'Unable to connect to reflections server.');
            } finally {
                if (active) setLoading(false);
            }
        };

        loadDetail();
        return () => {
            active = false;
        };
    }, [isAuthenticated, isId, isRestoring, lang, slug]);

    const chapterHref = useMemo(() => {
        if (!reflection?.verse_ref) return `/versehub/${lang}`;
        const [book, chapter] = reflection.verse_ref.split('-');
        return `/versehub/${lang}/${book}-${chapter}`;
    }, [lang, reflection?.verse_ref]);

    if (loading) {
        return <div className="min-h-screen bg-background animate-pulse" />;
    }

    return (
        <div className="min-h-screen bg-background pb-20 text-foreground">
            <nav className="sticky top-0 z-40 border-b border-border/50 bg-background/80 p-4 backdrop-blur-xl">
                <div className="mx-auto flex max-w-2xl items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-muted-foreground transition-all hover:bg-surface-elevated hover:text-foreground active:scale-95"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground/70">
                        {isId ? 'Detail Refleksi' : 'Reflection Detail'}
                    </span>
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-muted-foreground transition-all hover:bg-surface-elevated hover:text-foreground active:scale-95">
                        <Share2 className="h-4.5 w-4.5" />
                    </button>
                </div>
            </nav>

            <motion.article
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto mt-6 max-w-2xl px-5 md:px-8"
            >
                {authRequired ? (
                    <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 text-amber-900">
                        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                            <Lock className="h-5 w-5" />
                        </div>
                        <h1 className="text-xl font-black">{isId ? 'Login diperlukan' : 'Login required'}</h1>
                        <p className="mt-2 text-sm">
                            {isId
                                ? 'Detail refleksi hanya tersedia untuk sesi user yang sudah login.'
                                : 'Reflection detail is available only for authenticated users.'}
                        </p>
                    </section>
                ) : errorMessage ? (
                    <section className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-rose-900">
                        <h1 className="text-xl font-black">{isId ? 'Gagal memuat detail' : 'Failed to load detail'}</h1>
                        <p className="mt-2 text-sm">{errorMessage}</p>
                    </section>
                ) : !reflection ? (
                    <section className="rounded-[28px] border border-border/50 bg-surface p-6">
                        <h1 className="text-xl font-black text-foreground">
                            {isId ? 'Refleksi tidak ditemukan' : 'Reflection not found'}
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {isId
                                ? 'Endpoint detail by slug belum tersedia di backend. Halaman ini membaca item dari daftar refleksi user saat ini.'
                                : 'Detail-by-slug endpoint is not available yet. This page resolves from the current user reflection list.'}
                        </p>
                    </section>
                ) : (
                    <section className="space-y-6 rounded-[32px] border border-border/50 bg-surface p-6 shadow-soft">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand">
                                {reflection.verse_ref.toUpperCase()}
                            </p>
                            <h1 className="text-2xl font-black tracking-tight text-foreground">
                                {isId ? 'Respons Refleksi Pribadi' : 'Personal Reflection Response'}
                            </h1>
                            <p className="text-xs font-semibold text-muted-foreground">
                                {formatDate(reflection.created_at, lang)} • {reflection.is_private ? (isId ? 'Privat' : 'Private') : (isId ? 'Publik' : 'Public')}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                                {isId ? 'Pertanyaan Refleksi' : 'Reflection Prompt'}
                            </p>
                            <blockquote className="rounded-2xl bg-surface-muted p-4 text-base font-semibold leading-relaxed text-foreground">
                                {reflection.question_text}
                            </blockquote>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                                {isId ? 'Jawabanmu' : 'Your Response'}
                            </p>
                            <div className="rounded-2xl border border-border/50 bg-background p-4 text-sm leading-relaxed text-foreground">
                                {reflection.answer_text}
                            </div>
                        </div>

                        <button
                            onClick={() => router.push(chapterHref)}
                            className="inline-flex items-center rounded-full bg-foreground px-4 py-2 text-xs font-black uppercase tracking-widest text-background"
                        >
                            {isId ? 'Buka Pasal Terkait' : 'Open Related Chapter'}
                        </button>
                    </section>
                )}
            </motion.article>
        </div>
    );
}
