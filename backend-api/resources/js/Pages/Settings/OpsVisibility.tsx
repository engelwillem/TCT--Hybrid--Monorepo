
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
    AlertTriangle,
    ArrowUpRight,
    ClipboardList,
    RefreshCcw,
    ShieldCheck,
    Sparkles,
    TerminalSquare,
    Users,
    Wrench,
    X,
} from 'lucide-react';

type Threat = {
    label: string;
    count: number;
    severity: 'low' | 'medium' | 'high' | string;
    impact: string;
};

type Props = {
    generatedAt: string;
    viewer: {
        isAdmin: boolean;
        isIt: boolean;
        canDetail: boolean;
        canExecute: boolean;
        mode: 'summary' | 'detail' | string;
    };
    kpis: {
        usersTotal: number;
        adminsTotal: number;
        itTotal: number;
        publishedPosts7d: number;
        scheduledPosts: number;
        memberPostsActive: number;
        comments24h: number;
        ssCoveragePercent: number;
        opsActions7d: number;
        moderationOps24h: number;
    };
    risk: {
        score: number;
        level: string;
        impactSummary: string;
    };
    threats: Threat[];
    planAudit: {
        documents: Array<{
            name: string;
            path: string;
            exists: boolean;
            heading?: string | null;
            summary: string;
            stats: {
                total: number;
                completed: number;
                pending: number;
            };
            pendingItems: string[];
        }>;
        nextActions: Array<{
            document: string;
            text: string;
        }>;
    };
    opsActions: Array<{
        key: string;
        label: string;
        description: string;
        impact: string;
        canRun: boolean;
    }>;
    recentExecutions: Array<{
        id: number;
        action: string;
        details: Record<string, unknown>;
        createdAt?: string | null;
    }>;
    lastExecution?: {
        action: string;
        status: string;
        exitCode: number;
        output?: string | null;
        executedAt?: string | null;
    } | null;
    adminDrilldown: Array<{
        label: string;
        href: string;
    }>;
};

function severityClass(severity: string) {
    if (severity === 'high') return 'text-rose-700 bg-rose-50 ring-rose-200';
    if (severity === 'medium') return 'text-amber-700 bg-amber-50 ring-amber-200';
    return 'text-emerald-700 bg-emerald-50 ring-emerald-200';
}

function toneByRisk(level: string) {
    if (level === 'Tinggi') {
        return {
            status: 'High Risk',
            title: 'Status Hari Ini: High Risk',
            text: 'Ada indikator penting yang perlu ditangani agar pengalaman pengguna tetap stabil.',
            chip: 'bg-rose-50 text-rose-700 ring-rose-200',
            bar: 'from-rose-300 to-rose-100',
        };
    }

    if (level === 'Menengah') {
        return {
            status: 'Needs Attention',
            title: 'Status Hari Ini: Perlu Perhatian',
            text: 'Beberapa area memerlukan tindakan agar pengalaman pengguna tetap optimal.',
            chip: 'bg-amber-50 text-amber-700 ring-amber-200',
            bar: 'from-amber-300 to-amber-100',
        };
    }

    return {
        status: 'Healthy',
        title: 'Status Hari Ini: Healthy',
        text: 'Semua sistem berjalan normal dan konten inti tersedia.',
        chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
        bar: 'from-emerald-300 to-emerald-100',
    };
}

export default function OpsVisibility({
    generatedAt,
    viewer,
    kpis,
    risk,
    threats,
    planAudit,
    opsActions,
    recentExecutions,
    lastExecution,
    adminDrilldown,
}: Props) {
    const [viewMode, setViewMode] = useState<'simple' | 'technical'>('simple');
    const [drawer, setDrawer] = useState<{
        title: string;
        summary: string;
        details?: string[];
    } | null>(null);
    const [pendingActionKey, setPendingActionKey] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);
    const [focusTodayAttention, setFocusTodayAttention] = useState(false);

    const riskBar = useMemo(() => Math.max(4, Math.min(100, risk.score)), [risk.score]);
    const riskTone = toneByRisk(risk.level);
    const criticalThreats = threats.filter((t) => t.severity === 'high').length;
    const warningThreats = threats.filter((t) => t.severity === 'medium').length;
    const okThreats = threats.filter((t) => t.severity === 'low').length;

    const todayAttention = useMemo(() => {
        const items: Array<{
            key: string;
            title: string;
            impact: string;
            cta: string;
            secondary: string;
            actionKey?: string;
            details: string[];
        }> = [];

        if (kpis.scheduledPosts > 0) {
            items.push({
                key: 'scheduled',
                title: 'Scheduled Post Belum Ditayangkan',
                impact: 'Ada konten terjadwal yang perlu dipastikan tayang tepat waktu.',
                cta: 'Publish Scheduled Posts',
                secondary: 'Lihat detail jadwal konten',
                actionKey: 'publish_due_posts',
                details: [`Scheduled posts saat ini: ${kpis.scheduledPosts}`],
            });
        }

        if (threats.some((t) => t.label.includes('Failed Jobs') && t.count > 0)) {
            items.push({
                key: 'failed-jobs',
                title: 'Proses Backend Ada yang Tertunda',
                impact: 'Beberapa proses sistem mungkin belum selesai, bisa mempengaruhi update data.',
                cta: 'Lihat Threat Monitor',
                secondary: 'Tampilkan rincian failed jobs',
                details: ['Disarankan cek panel threat untuk detail sumber proses yang gagal.'],
            });
        }

        if (kpis.ssCoveragePercent < 70) {
            items.push({
                key: 'coverage',
                title: 'Coverage Sabbath School Perlu Ditingkatkan',
                impact: 'Konten belum merata, beberapa hari mungkin belum memiliki materi lengkap.',
                cta: 'Lihat KPI Coverage',
                secondary: 'Buka detail cakupan publikasi',
                details: [`Coverage saat ini: ${kpis.ssCoveragePercent}%`],
            });
        }

        return items.slice(0, 3);
    }, [kpis.scheduledPosts, kpis.ssCoveragePercent, threats]);

    const executionGroups = useMemo(() => {
        const safe = new Set(['publish_due_posts', 'cleanup_expired_member_posts']);
        return {
            safe: opsActions.filter((a) => safe.has(a.key)),
            admin: opsActions.filter((a) => !safe.has(a.key)),
        };
    }, [opsActions]);

    useEffect(() => {
        if (!lastExecution) return;
        setToast(`Action "${lastExecution.action}" selesai: ${lastExecution.status.toUpperCase()}`);
    }, [lastExecution]);

    useEffect(() => {
        if (!toast) return;
        const tid = window.setTimeout(() => setToast(null), 2800);
        return () => window.clearTimeout(tid);
    }, [toast]);

    useEffect(() => {
        // Allow deep-linking from /profile.
        // Example: /settings/ops-visibility#today-attention
        if (typeof window === 'undefined') return;

        const hash = String(window.location.hash || '');
        if (hash !== '#today-attention') return;

        const el = document.getElementById('today-attention');
        if (!el) return;

        // Slight delay to ensure layout is stable.
        window.setTimeout(() => {
            try {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch {
                el.scrollIntoView();
            }
            setFocusTodayAttention(true);
            window.setTimeout(() => setFocusTodayAttention(false), 1600);
        }, 80);
    }, []);

    function runOpsAction(actionKey: string) {
        setToast('Tindakan sedang dijalankan...');
        router.post(
            '/settings/ops-visibility/execute',
            { action: actionKey },
            {
                preserveScroll: true,
            },
        );
    }

    function requestRunAction(actionKey: string) {
        setPendingActionKey(actionKey);
    }

    function confirmRunAction() {
        if (!pendingActionKey) return;
        runOpsAction(pendingActionKey);
        setPendingActionKey(null);
    }

    const pendingAction = pendingActionKey ? opsActions.find((a) => a.key === pendingActionKey) ?? null : null;
    const technicalEnabled = viewer.canDetail && viewMode === 'technical';

    return (
        <MobileAppLayout title="Ops Visibility" activeNavId="settings" backHref="/profile">
            <Head title="Ops Visibility" />

            <div className="space-y-5 bg-slate-50 text-slate-800">
                <section className="sticky top-4 z-20 rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm backdrop-blur-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Non-IT Visibility Dashboard</p>
                            <h2 className="mt-1 text-xl font-semibold">Ops Control Center</h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 ring-1 ring-slate-200">
                                Last Updated: {generatedAt}
                            </span>
                            <button
                                type="button"
                                onClick={() => router.reload()}
                                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                <RefreshCcw className="h-3.5 w-3.5" />
                                Refresh
                            </button>
                            <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('simple')}
                                    className={`rounded-full px-3 py-1 font-semibold ${viewMode === 'simple' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
                                >
                                    Simple View
                                </button>
                                <button
                                    type="button"
                                    onClick={() => viewer.canDetail && setViewMode('technical')}
                                    disabled={!viewer.canDetail}
                                    className={`rounded-full px-3 py-1 font-semibold ${viewMode === 'technical' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'} disabled:cursor-not-allowed disabled:opacity-40`}
                                >
                                    Technical View
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        <a
                            href="/admintalk"
                            className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                        >
                            Masuk Admin Dashboard
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                        {viewer.isIt ? (
                            <a
                                href="/admintalk/users"
                                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                            >
                                Kelola Role User
                            </a>
                        ) : null}
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-4 md:grid-cols-12">
                    <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm md:col-span-8">
                        <div className="flex items-center justify-between gap-3">
                            <div className="inline-flex items-center gap-2 text-sm font-semibold">
                                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                System Mood
                            </div>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${riskTone.chip}`}>
                                {riskTone.status}
                            </span>
                        </div>
                        <h3 className="mt-3 text-lg font-semibold">{riskTone.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">{riskTone.text}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-rose-700 ring-1 ring-rose-200">
                                {criticalThreats} Critical
                            </span>
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700 ring-1 ring-amber-200">
                                {warningThreats} Warning
                            </span>
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 ring-1 ring-emerald-200">
                                {okThreats} OK
                            </span>
                        </div>
                        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className={`h-full rounded-full bg-gradient-to-r ${riskTone.bar} transition-all duration-700 ease-out`}
                                style={{ width: `${riskBar}%` }}
                            />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                            <span>{risk.impactSummary}</span>
                            <span className="font-semibold text-slate-700">{risk.score}/100</span>
                        </div>
                    </div>

                    <div
                        id="today-attention"
                        className={`rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm md:col-span-4 transition ${
                            focusTodayAttention ? 'ring-2 ring-amber-300/70 ring-offset-2 ring-offset-slate-50' : ''
                        }`}
                    >
                        <div className="inline-flex items-center gap-2 text-sm font-semibold">
                            <Sparkles className="h-4 w-4 text-amber-600" />
                            Today Attention
                        </div>
                        {todayAttention.length > 0 ? (
                            <div className="mt-3 space-y-3">
                                {todayAttention.map((item) => (
                                    <div key={item.key} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                        <p className="text-sm font-semibold">{item.title}</p>
                                        <p className="mt-1 text-xs text-slate-600">{item.impact}</p>
                                        <div className="mt-3 flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (item.actionKey) {
                                                        requestRunAction(item.actionKey);
                                                    } else {
                                                        setDrawer({
                                                            title: item.title,
                                                            summary: item.impact,
                                                            details: item.details,
                                                        });
                                                    }
                                                }}
                                                className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                                            >
                                                {item.cta}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDrawer({
                                                        title: item.title,
                                                        summary: item.impact,
                                                        details: item.details,
                                                    })
                                                }
                                                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                                            >
                                                {item.secondary}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">
                                🌿 Semua berjalan baik hari ini.
                            </p>
                        )}
                    </div>
                </section>

                <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {[
                        {
                            label: 'Total User/Admin/IT',
                            value: `${kpis.usersTotal}`,
                            sub: `Admin ${kpis.adminsTotal} · IT ${kpis.itTotal}`,
                        },
                        {
                            label: 'Publikasi 7 Hari',
                            value: `${kpis.publishedPosts7d}`,
                            sub: 'Konten tayang 7 hari terakhir',
                        },
                        {
                            label: 'Scheduled Post',
                            value: `${kpis.scheduledPosts}`,
                            sub: 'Antrian konten terjadwal',
                        },
                        {
                            label: 'Diskusi 24 Jam',
                            value: `${kpis.comments24h}`,
                            sub: `Member posts aktif ${kpis.memberPostsActive}`,
                        },
                        {
                            label: 'Coverage Sabbath School',
                            value: `${kpis.ssCoveragePercent}%`,
                            sub: 'Persentase hari yang publish',
                        },
                        {
                            label: 'Ops Action 7 Hari',
                            value: `${kpis.opsActions7d}`,
                            sub: 'Aktivitas audit dan maintenance',
                        },
                    ].map((item) => (
                        <div key={item.label} className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
                            <p className="text-xs text-slate-500">{item.label}</p>
                            <p className="mt-1 text-2xl font-semibold">{item.value}</p>
                            <p className="mt-1 text-xs text-slate-600">{item.sub}</p>
                        </div>
                    ))}
                </section>

                <section className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <h3 className="text-base font-semibold">Threat Monitor</h3>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                        {threats.map((t) => (
                            <div key={t.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold">{t.label}</p>
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${severityClass(t.severity)}`}>
                                        {t.severity.toUpperCase()}
                                    </span>
                                </div>
                                <p className="mt-1 text-2xl font-semibold">{t.count}</p>
                                <p className="mt-1 text-xs text-slate-600">
                                    {viewer.canDetail ? t.impact : 'Status operasional terpantau oleh tim internal.'}
                                </p>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setDrawer({
                                            title: t.label,
                                            summary: t.impact,
                                            details: technicalEnabled
                                                ? [`Severity: ${t.severity}`, `Count: ${t.count}`]
                                                : ['Aktifkan Technical View untuk detail teknis.'],
                                        })
                                    }
                                    className="mt-3 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                                >
                                    See details
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
                {viewer.canExecute ? (
                    <section className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-2">
                            <Wrench className="h-4 w-4 text-slate-700" />
                            <h3 className="text-base font-semibold">Execution Center</h3>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                            Jalankan operasi penting dengan aman. Detail teknis tampil hanya di Technical View.
                        </p>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                <p className="text-sm font-semibold text-emerald-800">Safe Actions</p>
                                <div className="mt-3 space-y-3">
                                    {executionGroups.safe.map((action) => (
                                        <div key={action.key} className="rounded-xl border border-emerald-100 bg-white p-3">
                                            <p className="text-sm font-semibold">{action.label}</p>
                                            <p className="mt-1 text-xs text-slate-600">{action.description}</p>
                                            <button
                                                type="button"
                                                onClick={() => requestRunAction(action.key)}
                                                disabled={!action.canRun || !viewer.canExecute}
                                                className="mt-3 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Jalankan
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {viewer.canDetail ? (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                                    <p className="text-sm font-semibold text-amber-800">IT/Admin Actions</p>
                                    <div className="mt-3 space-y-3">
                                        {executionGroups.admin.map((action) => (
                                            <div key={action.key} className="rounded-xl border border-amber-100 bg-white p-3">
                                                <p className="text-sm font-semibold">{action.label}</p>
                                                <p className="mt-1 text-xs text-slate-600">{action.description}</p>
                                                <button
                                                    type="button"
                                                    onClick={() => requestRunAction(action.key)}
                                                    disabled={!action.canRun || !viewer.canExecute}
                                                    className="mt-3 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    Jalankan
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-sm font-semibold text-slate-700">IT Actions disembunyikan</p>
                                    <p className="mt-1 text-xs text-slate-600">
                                        Akun non-IT hanya menampilkan Safe Actions untuk menjaga operasional tetap aman.
                                    </p>
                                </div>
                            )}
                        </div>

                        {lastExecution ? (
                            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <p className="text-sm font-semibold">
                                    Last Execution: {lastExecution.action} ({lastExecution.status})
                                </p>
                                <p className="mt-1 text-xs text-slate-600">
                                    Exit code {lastExecution.exitCode} · {lastExecution.executedAt}
                                </p>
                                {technicalEnabled && lastExecution.output ? (
                                    <p className="mt-1 text-xs text-slate-600">{lastExecution.output}</p>
                                ) : null}
                            </div>
                        ) : null}
                    </section>
                ) : null}

                <section className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                        <TerminalSquare className="h-4 w-4 text-slate-700" />
                        <h3 className="text-base font-semibold">Logs & Audit Timeline</h3>
                    </div>
                    {recentExecutions.length > 0 ? (
                        <div className="mt-4 space-y-2">
                            {recentExecutions.slice(0, 8).map((entry) => {
                                const status = String(entry.details.status ?? 'unknown').toUpperCase();
                                const label = String(entry.details.label ?? entry.action);
                                return (
                                    <button
                                        type="button"
                                        key={entry.id}
                                        onClick={() =>
                                            setDrawer({
                                                title: label,
                                                summary: `Status ${status} · ${entry.createdAt ?? '-'}`,
                                                details: technicalEnabled
                                                    ? [
                                                          `raw_command_key: ${entry.action}`,
                                                          `exit_code: ${String(entry.details.exit_code ?? '-')}`,
                                                          `correlation_id: ${entry.id}`,
                                                          `json_payload: ${JSON.stringify(entry.details)}`,
                                                      ]
                                                    : ['Aktifkan Technical View untuk raw payload dan metadata.'],
                                            })
                                        }
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-sm font-semibold">{label}</p>
                                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                                                {status}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-slate-600">{entry.createdAt ?? '-'}</p>
                                        <p className="mt-1 text-xs text-slate-500">Klik untuk detail.</p>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="mt-3 text-sm text-slate-600">Belum ada eksekusi terbaru.</p>
                    )}
                </section>

                <section className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-slate-700" />
                        <h3 className="text-base font-semibold">Audit Plan Board</h3>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                        Viewer markdown untuk rencana internal: RENCANA SELANJUTNYA, FOCUS-CHAIN-LIST, PROGRESS.
                    </p>
                    <Tabs defaultValue={planAudit.documents[0]?.name ?? 'none'} className="mt-4">
                        <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-xl bg-slate-100 p-1">
                            {planAudit.documents.map((doc) => (
                                <TabsTrigger
                                    key={doc.name}
                                    value={doc.name}
                                    className="rounded-lg border border-transparent text-xs data-[state=active]:border-slate-200"
                                >
                                    {doc.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        {planAudit.documents.map((doc) => (
                            <TabsContent key={doc.name} value={doc.name}>
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-sm font-semibold">{doc.heading ?? doc.name}</p>
                                        <p className="text-xs text-slate-600">
                                            Done {doc.stats.completed} · Pending {doc.stats.pending} · Total {doc.stats.total}
                                        </p>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-600">{doc.summary}</p>
                                    {doc.pendingItems.length > 0 ? (
                                        <div className="mt-3 space-y-1">
                                            {doc.pendingItems.slice(0, 5).map((item) => (
                                                <p key={item} className="text-sm text-slate-700">
                                                    • {item}
                                                </p>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="mt-3 text-sm text-emerald-700">Tidak ada pending item.</p>
                                    )}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                    {planAudit.nextActions.length > 0 ? (
                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-semibold">Next Action Queue</p>
                            <div className="mt-2 space-y-1 text-sm text-slate-600">
                                {planAudit.nextActions.slice(0, 6).map((item) => (
                                    <p key={`${item.document}-${item.text}`}>
                                        {item.document}: {item.text}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </section>

                <section className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-700" />
                        <h3 className="text-base font-semibold">Quick Links</h3>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                        {adminDrilldown.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700 hover:bg-white"
                            >
                                {link.label}
                            </a>
                        ))}
                        {adminDrilldown.length === 0 ? (
                            <div className="col-span-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                                Quick links tersedia untuk role dengan akses detail.
                            </div>
                        ) : null}
                    </div>
                </section>

                <div className="flex justify-center">
                    <Link
                        href="/profile"
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                        ← Kembali ke Settings
                    </Link>
                </div>
            </div>

            {drawer ? (
                <div className="fixed inset-0 z-[80]">
                    <button
                        type="button"
                        aria-label="Close detail drawer"
                        onClick={() => setDrawer(null)}
                        className="absolute inset-0 bg-slate-900/30"
                    />
                    <aside className="absolute inset-y-0 right-0 w-full max-w-md border-l border-slate-200 bg-white p-5 shadow-xl">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Detail Drawer</p>
                                <h4 className="mt-1 text-lg font-semibold">{drawer.title}</h4>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDrawer(null)}
                                className="rounded-full border border-slate-200 p-1 text-slate-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="mt-3 text-sm text-slate-600">{drawer.summary}</p>
                        {drawer.details && drawer.details.length > 0 ? (
                            <div className="mt-4 space-y-2">
                                {drawer.details.map((item) => (
                                    <p key={item} className="rounded-lg bg-slate-50 p-2 text-xs text-slate-700">
                                        {item}
                                    </p>
                                ))}
                            </div>
                        ) : null}
                    </aside>
                </div>
            ) : null}

            {pendingAction ? (
                <div className="fixed inset-0 z-[85]">
                    <button
                        type="button"
                        aria-label="Close confirmation modal"
                        onClick={() => setPendingActionKey(null)}
                        className="absolute inset-0 bg-slate-900/40"
                    />
                    <div className="absolute inset-0 flex items-center justify-center px-4">
                        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
                            <h4 className="text-base font-semibold">Konfirmasi Tindakan</h4>
                            <p className="mt-2 text-sm text-slate-600">
                                Anda akan menjalankan tindakan berikut: <span className="font-semibold">{pendingAction.label}</span>.
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                                Tindakan ini aman dan tidak menghapus data. Lanjutkan?
                            </p>
                            {technicalEnabled ? (
                                <p className="mt-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-600">key: {pendingAction.key}</p>
                            ) : null}
                            <div className="mt-4 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPendingActionKey(null)}
                                    className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmRunAction}
                                    className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                                >
                                    Ya, Jalankan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            {toast ? (
                <div className="pointer-events-none fixed left-1/2 top-6 z-[90] -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-lg">
                    {toast}
                </div>
            ) : null}
        </MobileAppLayout>
    );
}
