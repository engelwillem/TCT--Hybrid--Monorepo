"use client";

import { useEffect, useMemo, useState } from "react";

type SummaryResponse = {
  total_leads: number;
  completed: number;
  failed: number;
  avg_duration_ms: number | null;
  stage_distribution: Array<{ current_stage: string; total: number }>;
  failure_reasons: Array<{ error_code: string; total: number }>;
};

type KpiDetailResponse = {
  range: { days: number; from: string; to: string };
  daily_kpis: Array<{
    date: string;
    total_leads: number;
    completed_runs: number;
    failed_runs: number;
    avg_duration_ms: number;
    ai_summary_count: number;
    email_sent_count: number;
    crm_sync_count: number;
  }>;
  funnel_success_counts: Array<{ stage: string; total: number }>;
  failure_by_error_code: Array<{ error_code: string | null; total: number }>;
  integration_health: Array<{ stage: string; success_count: number; failed_count: number }>;
};

function formatDuration(ms: number | null): string {
  if (ms === null || Number.isNaN(ms)) return "-";
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export default function AiosDashboardPage() {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [detail, setDetail] = useState<KpiDetailResponse | null>(null);
  const [integrationTest, setIntegrationTest] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [summaryRes, detailRes] = await Promise.all([
          fetch("/api/onboarding/dashboard/summary", { cache: "no-store" }),
          fetch("/api/onboarding/dashboard/kpi-detail?days=30", { cache: "no-store" }),
        ]);

        if (!summaryRes.ok) throw new Error(`Summary API failed (${summaryRes.status})`);
        if (!detailRes.ok) throw new Error(`KPI detail API failed (${detailRes.status})`);

        const summaryJson = (await summaryRes.json()) as SummaryResponse;
        const detailJson = (await detailRes.json()) as KpiDetailResponse;

        if (!active) return;
        setSummary(summaryJson);
        setDetail(detailJson);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load dashboard.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const successRate = useMemo(() => {
    if (!summary || summary.total_leads === 0) return 0;
    return Math.round((summary.completed / summary.total_leads) * 100);
  }, [summary]);

  const runIntegrationTest = async () => {
    setIntegrationTest(null);
    const res = await fetch("/api/onboarding/integrations/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const payload = (await res.json()) as Record<string, unknown>;
    setIntegrationTest({
      http_status: res.status,
      ...payload,
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold tracking-tight">AIOS - Financial Advisory KPI Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">
          Client onboarding automation observability for portfolio demonstration.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={runIntegrationTest}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Test CRM/Calendar Integration
          </button>
        </div>

        {integrationTest ? (
          <pre className="mt-4 overflow-auto rounded-xl border border-slate-200 bg-white p-4 text-xs">
            {JSON.stringify(integrationTest, null, 2)}
          </pre>
        ) : null}

        {loading ? <p className="mt-8 text-sm text-slate-600">Loading KPI dashboard...</p> : null}
        {error ? <p className="mt-8 text-sm text-red-600">{error}</p> : null}

        {summary && detail ? (
          <>
            <section className="mt-8 grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-500">Total Leads</p>
                <p className="mt-2 text-2xl font-bold">{summary.total_leads}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-500">Completed</p>
                <p className="mt-2 text-2xl font-bold">{summary.completed}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-500">Success Rate</p>
                <p className="mt-2 text-2xl font-bold">{successRate}%</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-500">Avg Duration</p>
                <p className="mt-2 text-2xl font-bold">{formatDuration(summary.avg_duration_ms)}</p>
              </div>
            </section>

            <section className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h2 className="text-sm font-semibold">Stage Distribution</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {summary.stage_distribution.map((item) => (
                    <li key={item.current_stage} className="flex items-center justify-between">
                      <span>{item.current_stage}</span>
                      <span className="font-semibold">{item.total}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h2 className="text-sm font-semibold">Integration Health</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {detail.integration_health.map((item) => (
                    <li key={item.stage} className="flex items-center justify-between">
                      <span>{item.stage}</span>
                      <span className="font-semibold">
                        {item.success_count} success / {item.failed_count} failed
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4">
              <h2 className="text-sm font-semibold">Daily KPI Trend ({detail.range.from} to {detail.range.to})</h2>
              <div className="mt-4 overflow-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs text-slate-500">
                      <th className="px-2 py-2">Date</th>
                      <th className="px-2 py-2">Leads</th>
                      <th className="px-2 py-2">Completed</th>
                      <th className="px-2 py-2">Failed</th>
                      <th className="px-2 py-2">AI Summary</th>
                      <th className="px-2 py-2">Email</th>
                      <th className="px-2 py-2">CRM Sync</th>
                      <th className="px-2 py-2">Avg Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.daily_kpis.map((row) => (
                      <tr key={row.date} className="border-b border-slate-100">
                        <td className="px-2 py-2">{row.date}</td>
                        <td className="px-2 py-2">{row.total_leads}</td>
                        <td className="px-2 py-2">{row.completed_runs}</td>
                        <td className="px-2 py-2">{row.failed_runs}</td>
                        <td className="px-2 py-2">{row.ai_summary_count}</td>
                        <td className="px-2 py-2">{row.email_sent_count}</td>
                        <td className="px-2 py-2">{row.crm_sync_count}</td>
                        <td className="px-2 py-2">{formatDuration(row.avg_duration_ms)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}

