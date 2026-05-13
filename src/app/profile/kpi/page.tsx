"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import MobileAppLayout from "@/layouts/MobileAppLayout";
import { fetchWithAppAuth } from "@/lib/app-auth-fetch";

type ProfilePayload = {
  data?: {
    user?: {
      email?: string;
      is_admin?: boolean;
    };
  };
};

type AutomationEvent = {
  id: number;
  workflow: string;
  trigger_source: string | null;
  status: string;
  channel: string | null;
  intent: string | null;
  confidence: number | null;
  recommended_action: string | null;
  idempotency_key: string | null;
  subject_type: string | null;
  subject_id: number | null;
  user_id: number | null;
  attempt: number;
  duration_ms: number | null;
  available_for_retry: boolean;
  error_code: string | null;
  error_message: string | null;
  processed_at: string | null;
  escalated_at: string | null;
  created_at: string | null;
};

type AutomationKpiPayload = {
  data?: {
    metrics?: {
      total_events?: number;
      success_count?: number;
      failed_count?: number;
      retry_count?: number;
      escalation_count?: number;
      success_rate?: number;
      failure_rate?: number;
      avg_processing_ms?: number;
    };
    workflow_state?: Record<string, "paused" | "running">;
    events?: AutomationEvent[];
  };
};

type KpiState = {
  loading: boolean;
  busyWorkflow: string | null;
  busyRetryEventId: number | null;
  error: string | null;
  metrics: {
    totalEvents: number;
    successCount: number;
    failedCount: number;
    retryCount: number;
    escalationCount: number;
    successRate: number;
    failureRate: number;
    avgProcessingMs: number;
  };
  workflowState: Record<string, "paused" | "running">;
  events: AutomationEvent[];
};

const INITIAL_STATE: KpiState = {
  loading: true,
  busyWorkflow: null,
  busyRetryEventId: null,
  error: null,
  metrics: {
    totalEvents: 0,
    successCount: 0,
    failedCount: 0,
    retryCount: 0,
    escalationCount: 0,
    successRate: 0,
    failureRate: 0,
    avgProcessingMs: 0,
  },
  workflowState: {},
  events: [],
};

function fmtDate(value: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

function workflowLabel(key: string): string {
  if (key === "wa_queue_birthday") return "WA Queue Birthday";
  if (key === "wa_queue_routine") return "WA Queue Routine";
  if (key === "wa_process_due") return "WA Process Due";
  return key;
}

export default function ProfileKpiPage() {
  const router = useRouter();
  const [state, setState] = useState<KpiState>(INITIAL_STATE);

  const load = useCallback(async () => {
    try {
      const [profileRes, kpiRes] = await Promise.all([
        fetchWithAppAuth("/api/profile", { method: "GET" }),
        fetchWithAppAuth("/api/profile/automation/kpi?limit=20", { method: "GET" }),
      ]);

      if (profileRes.status === 401 || kpiRes.status === 401) {
        router.replace("/login?next=/profile/kpi");
        return;
      }

      const profileJson = (await profileRes.json().catch(() => ({}))) as ProfilePayload;
      const email = String(profileJson?.data?.user?.email ?? "").trim().toLowerCase();
      const isAdmin = Boolean(profileJson?.data?.user?.is_admin);
      if (!isAdmin || email !== "engel.willem@gmail.com") {
        router.replace("/profile");
        return;
      }

      if (!kpiRes.ok) {
        throw new Error("Failed to load automation KPI");
      }

      const kpiJson = (await kpiRes.json().catch(() => ({}))) as AutomationKpiPayload;
      const m = kpiJson?.data?.metrics ?? {};
      const workflowState = kpiJson?.data?.workflow_state ?? {};
      const events = Array.isArray(kpiJson?.data?.events) ? kpiJson.data.events : [];

      setState((prev) => ({
        ...prev,
        loading: false,
        error: null,
        metrics: {
          totalEvents: Number(m.total_events ?? 0),
          successCount: Number(m.success_count ?? 0),
          failedCount: Number(m.failed_count ?? 0),
          retryCount: Number(m.retry_count ?? 0),
          escalationCount: Number(m.escalation_count ?? 0),
          successRate: Number(m.success_rate ?? 0),
          failureRate: Number(m.failure_rate ?? 0),
          avgProcessingMs: Number(m.avg_processing_ms ?? 0),
        },
        workflowState,
        events,
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to load automation KPI.",
      }));
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const riskLevel = useMemo(() => {
    if (state.metrics.escalationCount > 0) return "High";
    if (state.metrics.failedCount > 0 || state.metrics.retryCount > 0) return "Medium";
    return "Low";
  }, [state.metrics.escalationCount, state.metrics.failedCount, state.metrics.retryCount]);

  const toggleWorkflow = useCallback(
    async (workflow: string, action: "pause" | "resume") => {
      setState((prev) => ({ ...prev, busyWorkflow: workflow }));
      try {
        const res = await fetchWithAppAuth(`/api/profile/automation/workflows/${workflow}/${action}`, { method: "POST" });
        if (!res.ok) {
          throw new Error("Failed workflow action");
        }
        await load();
      } catch {
        setState((prev) => ({ ...prev, error: "Failed to update workflow state." }));
      } finally {
        setState((prev) => ({ ...prev, busyWorkflow: null }));
      }
    },
    [load]
  );

  const retryEvent = useCallback(
    async (eventId: number) => {
      setState((prev) => ({ ...prev, busyRetryEventId: eventId }));
      try {
        const res = await fetchWithAppAuth(`/api/profile/automation/events/${eventId}/retry`, { method: "POST" });
        if (!res.ok) throw new Error("Retry failed");
        await load();
      } catch {
        setState((prev) => ({ ...prev, error: "Failed to retry selected event." }));
      } finally {
        setState((prev) => ({ ...prev, busyRetryEventId: null }));
      }
    },
    [load]
  );

  return (
    <MobileAppLayout title="Automation KPI" activeNavId="profile" backHref="/profile">
      <div className="space-y-4">
        <div className="rounded-2xl border border-border/60 bg-surface p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Automation Control Center</p>
          <h2 className="mt-1 text-xl font-black text-foreground">AI + Automation System KPI</h2>
          <p className="mt-1 text-sm text-muted-foreground">Operational visibility untuk workflow orchestration.</p>
        </div>

        {state.error ? <div className="rounded-2xl border border-rose-300/40 bg-rose-50 p-4 text-sm text-rose-700">{state.error}</div> : null}

        <div className="grid grid-cols-2 gap-3">
          <KpiCard label="Total Events (7D)" value={state.loading ? "..." : String(state.metrics.totalEvents)} />
          <KpiCard label="Success Rate" value={state.loading ? "..." : `${state.metrics.successRate.toFixed(2)}%`} />
          <KpiCard label="Failure Rate" value={state.loading ? "..." : `${state.metrics.failureRate.toFixed(2)}%`} />
          <KpiCard label="Avg Process" value={state.loading ? "..." : `${state.metrics.avgProcessingMs} ms`} />
          <KpiCard label="Retries" value={state.loading ? "..." : String(state.metrics.retryCount)} />
          <KpiCard label="Escalations" value={state.loading ? "..." : String(state.metrics.escalationCount)} />
        </div>

        <div className="rounded-2xl border border-border/60 bg-surface p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Risk Level</p>
          <p className="mt-2 text-2xl font-black text-foreground">{state.loading ? "..." : riskLevel}</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-surface p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Workflow Controls</p>
          <div className="mt-3 space-y-2">
            {Object.keys(state.workflowState).length === 0 && !state.loading ? (
              <p className="text-sm text-muted-foreground">No workflow state data.</p>
            ) : null}
            {Object.entries(state.workflowState).map(([workflow, current]) => {
              const isPaused = current === "paused";
              const isBusy = state.busyWorkflow === workflow;
              return (
                <div key={workflow} className="flex items-center justify-between rounded-xl border border-border/50 bg-background p-3">
                  <div>
                    <p className="text-sm font-bold text-foreground">{workflowLabel(workflow)}</p>
                    <p className="text-xs text-muted-foreground">State: {current}</p>
                  </div>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => void toggleWorkflow(workflow, isPaused ? "resume" : "pause")}
                    className="rounded-lg border border-border/60 bg-surface-muted px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-foreground"
                  >
                    {isBusy ? "..." : isPaused ? "Resume" : "Pause"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-surface p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Recent Automation Events</p>
          <div className="mt-3 space-y-2">
            {state.loading ? <p className="text-sm text-muted-foreground">Loading...</p> : null}
            {!state.loading && state.events.length === 0 ? <p className="text-sm text-muted-foreground">No events yet.</p> : null}
            {state.events.map((event) => (
              <div key={event.id} className="rounded-xl border border-border/50 bg-background p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-foreground">
                    {event.workflow} · {event.status}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{fmtDate(event.created_at)}</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  channel={event.channel || "-"} · intent={event.intent || "-"} · attempt={event.attempt}
                </p>
                {event.error_message ? <p className="mt-1 text-xs text-rose-700">error: {event.error_message}</p> : null}
                {event.available_for_retry ? (
                  <button
                    type="button"
                    disabled={state.busyRetryEventId === event.id}
                    onClick={() => void retryEvent(event.id)}
                    className="mt-2 rounded-lg border border-border/60 bg-surface-muted px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-foreground"
                  >
                    {state.busyRetryEventId === event.id ? "Retrying..." : "Retry Failed"}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobileAppLayout>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-surface p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-black text-foreground">{value}</p>
    </div>
  );
}

