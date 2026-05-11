"use client";

import { useMemo, useRef, useState } from 'react';
import { fetchWithAppAuth } from '@/lib/app-auth-fetch';
import type { AsyncContractState } from '@/lib/async-state';

interface MentorInsights {
    reflection_questions?: string[];
    theme_connections?: string[];
    historical_context?: string | null;
    mentor_label?: string;
    disclaimer_id?: string;
}

interface VerseRelationship {
    ref: string;
    type: string;
    direction: 'to' | 'from';
    strength: number;
}

interface VerseTheme {
    slug: string;
    name_id: string;
    name_en: string;
}

interface StudyPath {
    slug: string;
    title: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface DenominationalContext {
    summary: string;
    traditions: Array<{
        name: string;
        view: string;
    }>;
}

interface AskResult {
    answer?: string;
    interpretation?: string;
    study_guidance?: string;
    related_refs?: string[];
    confidence?: string;
    grounding_note?: string | null;
    scripture_basis?: {
        anchor_ref?: string | null;
        anchor_text_excerpt?: string | null;
        related_refs?: string[];
    };
    sections?: {
        biblical_text?: string | null;
        interpretation?: string | null;
        study_guidance?: string | null;
    };
    mentor_label?: string;
    disclaimer_id?: string;
    session?: {
        id?: number;
        type?: string;
        turn_count?: number;
        updated_at?: string;
    } | null;
}

interface MentorPanelProps {
    /** Full verse reference string, e.g. "yoh-3-16" */
    verseRef: string;
    /** Language code: "id" | "en" */
    lang: string;
    /** Display-ready verse text */
    verseText: string;
    /** Display reference, e.g. "Yohanes 3:16" */
    verseLabel: string;
    /** Whether the current user is authenticated (affects Ask tab) */
    isAuthenticated: boolean;
    /** Active mood for context */
    activeMood: string;
    /** Optional user reflection from chapter reading flow */
    userReflection?: string | null;
    /** Initial context inherited from Renungan -> VerseHub bridge */
    initialMentorContext?: string | null;
    onShareWhatsApp?: () => void;
    isShareBusy?: boolean;
    onClose: () => void;
}

type Tab = 'reflect' | 'connect' | 'context' | 'ask';
type AskMode =
    | 'explain_simply'
    | 'practical_meaning'
    | 'prayer_from_verse'
    | 'related_verses'
    | 'tradition_context_note';

const ASK_MODE_OPTIONS: Array<{ value: AskMode; label: string }> = [
    { value: 'explain_simply', label: 'Simple explanation' },
    { value: 'practical_meaning', label: 'Practical meaning' },
    { value: 'prayer_from_verse', label: 'Prayer from this verse' },
    { value: 'related_verses', label: 'Related verses' },
    { value: 'tradition_context_note', label: 'Tradition/context note' },
];

function WhatsAppIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
            <path
                fill="currentColor"
                d="M19.05 4.94A9.87 9.87 0 0 0 12.03 2 9.94 9.94 0 0 0 2.1 11.95c0 1.74.46 3.44 1.34 4.94L2 22l5.28-1.38a9.9 9.9 0 0 0 4.74 1.2h.01a9.95 9.95 0 0 0 9.94-9.94 9.83 9.83 0 0 0-2.92-6.94ZM12.03 20.1h-.01a8.19 8.19 0 0 1-4.18-1.14l-.3-.18-3.14.83.84-3.06-.2-.31a8.2 8.2 0 0 1-1.25-4.33 8.24 8.24 0 0 1 8.24-8.24 8.15 8.15 0 0 1 5.83 2.42 8.21 8.21 0 0 1 2.41 5.83 8.24 8.24 0 0 1-8.24 8.18Zm4.52-6.18c-.25-.13-1.46-.72-1.69-.81-.23-.08-.4-.12-.58.12-.16.25-.64.81-.78.98-.14.16-.29.18-.54.06-.25-.13-1.03-.38-1.96-1.2-.72-.64-1.2-1.43-1.35-1.67-.14-.25-.01-.38.1-.51.11-.11.25-.29.36-.43.12-.14.16-.24.25-.41.08-.16.04-.31-.02-.43-.07-.13-.57-1.37-.78-1.88-.21-.5-.42-.43-.58-.44h-.5c-.16 0-.43.07-.65.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.55c.13.16 1.72 2.62 4.16 3.67.58.25 1.04.41 1.4.52.58.18 1.1.16 1.51.1.46-.06 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.17-.05-.09-.22-.16-.47-.29Z"
            />
        </svg>
    );
}

export default function MentorPanel({
    verseRef,
    lang,
    verseText,
    verseLabel,
    isAuthenticated,
    activeMood,
    userReflection = null,
    initialMentorContext = null,
    onShareWhatsApp,
    isShareBusy = false,
    onClose,
}: MentorPanelProps) {
    const [tab, setTab] = useState<Tab>('reflect');
    const [insights, setInsights] = useState<MentorInsights | null>(null);
    const [relationships, setRelationships] = useState<VerseRelationship[]>([]);
    const [themes, setThemes] = useState<VerseTheme[]>([]);
    const [activeStudyPaths, setActiveStudyPaths] = useState<StudyPath[]>([]);
    const [denominationalContext, setDenominationalContext] = useState<DenominationalContext | null>(null);
    const [insightsState, setInsightsState] = useState<AsyncContractState>('idle');
    const [insightsFetched, setInsightsFetched] = useState(false);

    const [question, setQuestion] = useState('');
    const [askMode, setAskMode] = useState<AskMode>('explain_simply');
    const [askResult, setAskResult] = useState<AskResult | null>(null);
    const [askState, setAskState] = useState<AsyncContractState>('idle');
    const [askError, setAskError] = useState<string | null>(null);
    const insightsLoading = insightsState === 'loading';
    const askLoading = askState === 'submitting';

    const questionInputRef = useRef<HTMLTextAreaElement>(null);
    const effectiveReflectionContext = useMemo(() => {
        const direct = String(userReflection || "").replace(/\s+/g, " ").trim();
        if (direct) return direct;
        const initial = String(initialMentorContext || "").replace(/\s+/g, " ").trim();
        return initial || null;
    }, [initialMentorContext, userReflection]);
    const mentorRequestContext = useMemo(
        () => ({
            mood: activeMood,
            intent: 'deep_study',
            screen_context: 'versehub_reader',
            user_reflection: effectiveReflectionContext,
        }),
        [activeMood, effectiveReflectionContext]
    );

    // Fetch insights lazily on first open or tab switch.
    function ensureInsights() {
        if (insightsFetched || insightsLoading) return;
        setInsightsState('loading');

        const params = new URLSearchParams();
        if (effectiveReflectionContext) {
            params.set("user_reflection", effectiveReflectionContext);
        }
        const mentorInsightsHref = `/api/versehub/${encodeURIComponent(lang)}/${encodeURIComponent(verseRef)}/mentor${params.toString() ? `?${params.toString()}` : ""}`;

        fetchWithAppAuth(mentorInsightsHref, {
            cache: 'no-store',
        })
            .then((r) => (r.ok ? r.json() : null))
            .then((json) => {
                if (json?.insights) setInsights(json.insights);
                if (json?.relationships) setRelationships(json.relationships);
                if (json?.themes) setThemes(json.themes);
                if (json?.active_study_paths) setActiveStudyPaths(json.active_study_paths);
                if (json?.denominational_context) setDenominationalContext(json.denominational_context);
                setInsightsFetched(true);
                const hasAnyInsightData =
                    Boolean(json?.insights) ||
                    Boolean(json?.relationships?.length) ||
                    Boolean(json?.themes?.length) ||
                    Boolean(json?.denominational_context);
                setInsightsState(hasAnyInsightData ? 'ready' : 'fallback');
            })
            .catch(() => {
                setInsightsFetched(true);
                setInsightsState('fallback');
            });
    }

    function handleTabChange(next: Tab) {
        setTab(next);
        if (next === 'reflect' || next === 'context' || next === 'connect') ensureInsights();
        if (next === 'ask') setTimeout(() => questionInputRef.current?.focus(), 80);
    }

    function handleAsk(e: React.FormEvent) {
        e.preventDefault();
        const q = question.trim();
        if (!q || askLoading) return;
        if (!isAuthenticated) {
            setAskError('Login session not found. Please sign in again.');
            setAskState('fatal_error');
            return;
        }

        setAskState('submitting');
        setAskResult(null);
        setAskError(null);

        fetchWithAppAuth(`/api/versehub/${encodeURIComponent(lang)}/${encodeURIComponent(verseRef)}/mentor/ask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                question: q,
                mode: askMode,
                context: mentorRequestContext,
            }),
        })
            .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
            .then((json) => {
                setAskResult(json);
                setAskState('ready');
            })
            .catch((status) => {
                if (status === 429) {
                    setAskError('Question limit reached. Please try again in 1 hour.');
                    setAskState('retryable_error');
                } else {
                    setAskError('Something went wrong. Please try again.');
                    setAskState('retryable_error');
                }
            });
    }

    // Suggested starter questions
    const starterQuestions = [
        'What is the contextual meaning of this verse?',
        'How is this verse understood across denominations?',
        'Who was Jesus addressing in this passage?',
        'Is there prophecy fulfillment here?',
    ];

    return (
        <div className="fixed inset-0 z-[72]" role="dialog" aria-modal="true" aria-label="Scripture Guide">
            {/* Backdrop */}
            <button
                type="button"
                className="absolute inset-0 bg-black/30"
                onClick={onClose}
                aria-label="Close Scripture Guide"
            />

            {/* Panel */}
            <aside className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-3xl bg-white shadow-2xl md:inset-x-auto md:bottom-6 md:right-6 md:w-[440px] md:rounded-3xl md:ring-1 md:ring-slate-200">
                {/* Header — always visible, always transparent */}
                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 pb-3 pt-4">
                    <div className="flex items-center gap-2.5">
                        <span className="text-lg text-amber-500">✦</span>
                        <div>
                            <p className="text-sm font-bold leading-tight text-slate-900">Scripture Guide</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onShareWhatsApp}
                            disabled={!onShareWhatsApp || isShareBusy}
                            aria-label="Share to WhatsApp"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#25D366] transition hover:bg-[#25D366]/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isShareBusy ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#25D366]/25 border-t-[#25D366]" />
                            ) : (
                                <WhatsAppIcon className="h-4 w-4" />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full px-2 py-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Verse reference label */}
                <div className="shrink-0 border-b border-slate-100 bg-slate-50/60 px-5 py-2">
                    <p className="text-[11px] font-semibold text-slate-500">{verseLabel}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">{verseText}</p>

                    {activeStudyPaths.length > 0 && (
                        <div className="mt-2 flex items-center gap-2 rounded-lg bg-emerald-50 px-2 py-1.5 ring-1 ring-emerald-100">
                            <span className="text-xs">🌱</span>
                            <p className="text-[10px] font-bold text-emerald-800">
                                This verse is part of: <span className="underline">{activeStudyPaths[0].title}</span>
                            </p>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex shrink-0 items-center gap-1 border-b border-slate-100 px-5 pt-2">
                    {(['reflect', 'connect', 'context', 'ask'] as Tab[]).map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => handleTabChange(t)}
                            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold capitalize transition-colors ${tab === t
                                ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {t === 'reflect' ? 'Reflect' : t === 'connect' ? 'Connect' : t === 'context' ? 'Context' : 'Ask'}
                        </button>
                    ))}
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                    {/* ── REFLECT TAB ── */}
                    {tab === 'reflect' && (
                        <>
                            {insightsLoading ? <LoadingSpinner /> : (
                                <div className="space-y-5">
                                    {effectiveReflectionContext ? (
                                        <div className="rounded-xl border border-indigo-100 bg-indigo-50/65 px-3.5 py-3">
                                            <SectionLabel color="slate">Initial Reflection Context</SectionLabel>
                                            <p className="mt-1.5 text-sm leading-relaxed text-indigo-900/75">
                                                {effectiveReflectionContext}
                                            </p>
                                        </div>
                                    ) : null}
                                    {insights?.reflection_questions?.length ? (
                                        <div>
                                            <SectionLabel color="amber">Reflection Questions</SectionLabel>
                                            <ul className="mt-2 space-y-2">
                                                {insights.reflection_questions.map((q, i) => (
                                                    <li
                                                        key={i}
                                                        className="rounded-none bg-amber-50 px-3.5 py-3 text-sm leading-relaxed text-slate-700 ring-1 ring-amber-100"
                                                    >
                                                        {q}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : null}

                                    {insights?.theme_connections?.length ? (
                                        <div>
                                            <SectionLabel color="sky">Theme Connections</SectionLabel>
                                            <ul className="mt-2 space-y-2">
                                                {insights.theme_connections.map((t, i) => (
                                                    <li
                                                        key={i}
                                                        className="rounded-none bg-sky-50 px-3.5 py-2.5 text-sm text-slate-700 ring-1 ring-sky-100"
                                                    >
                                                        {t}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : null}

                                    {!insights && (
                                        <p className="py-4 text-center text-sm text-slate-400">
                                            No insights available for this verse.
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* ── CONNECT TAB ── */}
                    {tab === 'connect' && (
                        <>
                            {insightsLoading ? <LoadingSpinner /> : (
                                <div className="space-y-6">
                                    {relationships.length > 0 ? (
                                        <div>
                                            <SectionLabel color="amber">Scripture Interprets Scripture</SectionLabel>
                                            <p className="mb-2 text-[10px] text-slate-400">Direct links to other verses:</p>
                                            <div className="space-y-2">
                                                {relationships.map((rel, i) => (
                                                    <a
                                                        key={i}
                                                        href={`/versehub/${lang}/${rel.ref}`}
                                                        className="flex items-center justify-between rounded-none bg-slate-50 px-4 py-3 ring-1 ring-slate-100 transition-all hover:bg-white hover:shadow-sm hover:ring-slate-200"
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-slate-700">{rel.ref.replace(/-/g, ' ').toUpperCase()}</span>
                                                            <span className="text-[10px] capitalize text-slate-400">{rel.type.replace(/_/g, ' ')}</span>
                                                        </div>
                                                        <span className="text-xs text-amber-500">Read →</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="py-4 text-center text-sm text-slate-400">
                                            No recorded verse relationships yet for {verseLabel}.
                                        </p>
                                    )}

                                    {themes.length > 0 && (
                                        <div>
                                            <SectionLabel color="sky">Related Themes</SectionLabel>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {themes.map((t) => (
                                                    <span
                                                        key={t.slug}
                                                        className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 ring-1 ring-sky-100"
                                                    >
                                                        {lang === 'id' ? t.name_id : t.name_en}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* ── CONTEXT TAB ── */}
                    {tab === 'context' && (
                        <>
                            {insightsLoading ? <LoadingSpinner /> : (
                                <div className="space-y-6">
                                    {insights?.historical_context ? (
                                        <div>
                                            <SectionLabel color="slate">Historical Context</SectionLabel>
                                            <p className="mt-2 rounded-none bg-slate-50 px-3.5 py-3 text-sm leading-relaxed text-slate-600 ring-1 ring-slate-200">
                                                {insights.historical_context}
                                            </p>
                                        </div>
                                    ) : null}

                                    {denominationalContext && (
                                        <div>
                                            <SectionLabel color="amber">Tradition Perspectives</SectionLabel>
                                            <p className="mt-2 text-xs text-slate-500 italic mb-3">"{denominationalContext.summary}"</p>
                                            <div className="space-y-3">
                                                {denominationalContext.traditions.map((trad, i) => (
                                                    <div key={i} className="rounded-none border border-slate-100 bg-white p-3 shadow-sm">
                                                        <p className="text-[10px] font-black uppercase text-slate-400">{trad.name}</p>
                                                        <p className="mt-1 text-sm text-slate-700 leading-relaxed">{trad.view}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {!insights?.historical_context && !denominationalContext && (
                                        <p className="py-4 text-center text-sm text-slate-400">
                                            Theological context is not available for this verse.
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* ── ASK TAB ── */}
                    {tab === 'ask' && (
                        <div className="space-y-4">
                            {!isAuthenticated ? (
                                <div className="rounded-2xl bg-slate-50 p-4 text-center ring-1 ring-slate-200">
                                    <p className="text-sm text-slate-600">
                                        Sign in to ask Scripture Guide about this verse.
                                    </p>
                                    <a
                                        href="/login"
                                        className="mt-3 inline-flex rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                                    >
                                        Sign In
                                    </a>
                                </div>
                            ) : (
                                <>
                                    {/* Starter suggestions */}
                                    {!askResult && (
                                        <div>
                                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                                Frequently asked questions:
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {starterQuestions.map((sq) => (
                                                    <button
                                                        key={sq}
                                                        type="button"
                                                        onClick={() => setQuestion(sq)}
                                                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-600 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                                                    >
                                                        {sq}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Ask form */}
                                    <form onSubmit={handleAsk} className="space-y-3">
                                        <textarea
                                            ref={questionInputRef}
                                            value={question}
                                            onChange={(e) => setQuestion(e.target.value)}
                                            placeholder="Ask something about this verse..."
                                            rows={3}
                                            maxLength={400}
                                            className="w-full resize-none rounded-2xl bg-slate-50 px-3.5 py-3 text-sm text-slate-800 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-300"
                                        />
                                        <div>
                                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                                Assistance mode
                                            </p>
                                            <select
                                                value={askMode}
                                                onChange={(event) => setAskMode(event.target.value as AskMode)}
                                                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-amber-300"
                                            >
                                                {ASK_MODE_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-[10px] text-slate-400">
                                                {question.length}/400
                                            </span>
                                            <button
                                                type="submit"
                                                disabled={question.trim().length < 3 || askLoading}
                                                className="rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40 hover:bg-amber-600"
                                            >
                                                {askLoading ? 'Loading...' : 'Ask ✦'}
                                            </button>
                                        </div>
                                    </form>

                                    {/* Error */}
                                    {askError && (
                                        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600 ring-1 ring-rose-100">
                                            {askError}
                                        </p>
                                    )}

                                    {/* Result */}
                                    {askResult && (
                                        <div className="space-y-4">
                                            <SectionLabel color="amber">Scripture Guide Answer</SectionLabel>

                                            {/* Explicit Biblical Text Layer */}
                                            {askResult.scripture_basis?.anchor_text_excerpt && (
                                                <div className="space-y-1.5 px-1">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                        Scripture Text (source)
                                                    </p>
                                                    <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700 ring-1 ring-slate-200">
                                                        {askResult.scripture_basis.anchor_text_excerpt}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Core Answer */}
                                            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-slate-700 ring-1 ring-amber-100/50">
                                                {askResult.answer}
                                            </div>

                                            {askResult.grounding_note && (
                                                <p className="px-1 text-[11px] leading-relaxed text-slate-500">
                                                    {askResult.grounding_note}
                                                </p>
                                            )}

                                            {/* Interpretation Layer */}
                                            {askResult.interpretation && (
                                                <div className="space-y-1.5 px-1">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Interpretation</p>
                                                    <p className="text-sm italic leading-relaxed text-slate-600">
                                                        {askResult.interpretation}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Study Guidance Layer */}
                                            {askResult.study_guidance && (
                                                <div className="rounded-2xl border border-dashed border-amber-200 bg-white p-4">
                                                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-amber-600">Study Guidance</p>
                                                    <p className="text-sm leading-relaxed text-slate-700">
                                                        {askResult.study_guidance}
                                                    </p>
                                                </div>
                                            )}

                                            {askResult.related_refs?.length ? (
                                                <div className="px-1 pt-1">
                                                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                        Related readings:
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {askResult.related_refs.map((r) => (
                                                            <a
                                                                key={r}
                                                                href={`/versehub/${lang}/${r}`}
                                                                className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-700 hover:bg-sky-100"
                                                            >
                                                                {r.replace(/-/g, ' ')}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : null}
                                            {askResult.session?.turn_count ? (
                                                <p className="px-1 text-[10px] uppercase tracking-widest text-slate-400">
                                                    Active mentor session • {askResult.session.turn_count} interactions
                                                </p>
                                            ) : null}
                                            <button
                                                type="button"
                                                className="text-xs text-slate-400 hover:text-slate-600"
                                                onClick={() => { setAskResult(null); setQuestion(''); }}
                                            >
                                                Ask another question →
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer disclaimer — always shown */}
            </aside>
        </div>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-200 border-t-amber-500" />
            <p className="text-xs text-slate-400">Loading insights...</p>
        </div>
    );
}

function SectionLabel({ children, color }: { children: React.ReactNode; color: 'amber' | 'sky' | 'slate' }) {
    const cls = {
        amber: 'text-amber-600',
        sky: 'text-sky-600',
        slate: 'text-slate-500',
    }[color];
    return (
        <p className={`text-[10px] font-bold uppercase tracking-widest ${cls}`}>{children}</p>
    );
}
