import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { Link } from '@inertiajs/react';

type VariantStat = {
    events: number;
    sessions: number;
};

type EventMap = Record<string, number>;

type DashboardProps = {
    range: {
        days: number;
        from: string;
        to: string;
    };
    platform: {
        users_total: number;
        new_users: number;
        active_posters: number;
        active_sessions_tracked: number;
    };
    landingAuth: {
        events_total: number;
        sessions_total: number;
        by_variant: Record<string, VariantStat>;
        by_event: EventMap;
        cta_ctr_pct: string;
    };
    versehub: {
        events_total: number;
        sessions_total: number;
        by_persona: Record<string, VariantStat>;
        by_variant: Record<string, VariantStat>;
        by_event: EventMap;
        start_here_ctr_pct: string;
    };
};

function MetricCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/60">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
            {hint ? <p className="mt-1 text-xs text-white/55">{hint}</p> : null}
        </div>
    );
}

function KeyValueTable({ data }: { data: Record<string, number | string> }) {
    const rows = Object.entries(data);
    if (!rows.length) {
        return <p className="text-sm text-white/60">Belum ada data.</p>;
    }

    return (
        <div className="space-y-2">
            {rows.map(([key, value]) => (
                <div key={key} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
                    <span className="text-white/70">{key}</span>
                    <span className="font-semibold text-white">{value}</span>
                </div>
            ))}
        </div>
    );
}

export default function KpiDashboard(props: DashboardProps) {
    const from = new Date(props.range.from).toLocaleString('id-ID');
    const to = new Date(props.range.to).toLocaleString('id-ID');

    const landingByVariant: Record<string, string> = Object.fromEntries(
        Object.entries(props.landingAuth.by_variant).map(([key, value]) => [key, `${value.events} ev / ${value.sessions} sess`]),
    );

    const versehubByVariant: Record<string, string> = Object.fromEntries(
        Object.entries(props.versehub.by_variant).map(([key, value]) => [key, `${value.events} ev / ${value.sessions} sess`]),
    );

    const versehubByPersona: Record<string, string> = Object.fromEntries(
        Object.entries(props.versehub.by_persona).map(([key, value]) => [key, `${value.events} ev / ${value.sessions} sess`]),
    );

    return (
        <MobileAppLayout title="KPI Dashboard" activeNavId="settings" backHref="/profile">
            <div className="space-y-4">
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-500/10 p-4">
                    <p className="text-sm text-cyan-100">Window: {props.range.days} hari</p>
                    <p className="mt-1 text-xs text-cyan-100/70">{from} - {to}</p>
                    <div className="mt-3 flex gap-2">
                        <Link href="/settings/kpi-dashboard?days=1" className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/85">1d</Link>
                        <Link href="/settings/kpi-dashboard?days=7" className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/85">7d</Link>
                        <Link href="/settings/kpi-dashboard?days=30" className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/85">30d</Link>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <MetricCard label="Total Users" value={props.platform.users_total} />
                    <MetricCard label="New Users" value={props.platform.new_users} hint={`Last ${props.range.days}d`} />
                    <MetricCard label="Active Posters" value={props.platform.active_posters} />
                    <MetricCard label="Tracked Sessions" value={props.platform.active_sessions_tracked} />
                </div>

                <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <h2 className="text-base font-semibold text-white">Landing Auth KPI</h2>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                        <MetricCard label="Events" value={props.landingAuth.events_total} />
                        <MetricCard label="Sessions" value={props.landingAuth.sessions_total} />
                        <MetricCard label="CTA CTR" value={props.landingAuth.cta_ctr_pct} />
                    </div>
                    <div className="mt-4">
                        <p className="mb-2 text-xs uppercase tracking-[0.12em] text-white/55">By Variant</p>
                        <KeyValueTable data={landingByVariant} />
                    </div>
                    <div className="mt-4">
                        <p className="mb-2 text-xs uppercase tracking-[0.12em] text-white/55">Top Events</p>
                        <KeyValueTable data={props.landingAuth.by_event} />
                    </div>
                </section>

                <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <h2 className="text-base font-semibold text-white">VerseHub Landing KPI</h2>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                        <MetricCard label="Events" value={props.versehub.events_total} />
                        <MetricCard label="Sessions" value={props.versehub.sessions_total} />
                        <MetricCard label="Start CTR" value={props.versehub.start_here_ctr_pct} />
                    </div>
                    <div className="mt-4">
                        <p className="mb-2 text-xs uppercase tracking-[0.12em] text-white/55">By Persona</p>
                        <KeyValueTable data={versehubByPersona} />
                    </div>
                    <div className="mt-4">
                        <p className="mb-2 text-xs uppercase tracking-[0.12em] text-white/55">By Variant</p>
                        <KeyValueTable data={versehubByVariant} />
                    </div>
                    <div className="mt-4">
                        <p className="mb-2 text-xs uppercase tracking-[0.12em] text-white/55">Top Events</p>
                        <KeyValueTable data={props.versehub.by_event} />
                    </div>
                </section>
            </div>
        </MobileAppLayout>
    );
}

