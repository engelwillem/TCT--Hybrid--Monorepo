"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { dashboardSummaryRequest, meRequest } from "@/lib/api";
import { clearAuthCookie, getAuthCookie } from "@/lib/auth";
import { Topbar } from "@/components/topbar";
import { isAuthFailure } from "@/lib/session";
import { readMetrics } from "@/lib/metrics";

type MeData = {
  user?: {
    id?: number;
    name?: string;
    email?: string;
    role?: string;
  };
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [me, setMe] = useState<MeData | null>(null);
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    terkirim: 0,
    gagal: 0,
    skip: 0,
    today: 0,
  });
  const [metrics, setMetrics] = useState<Record<string, number>>({});

  useEffect(() => {
    const run = async () => {
      const token = getAuthCookie();
      if (!token) {
        setError("Session not found. Please sign in again.");
        setLoading(false);
        router.replace("/login");
        return;
      }

      const result = await meRequest(token);
      if (!result.ok) {
        if (isAuthFailure(result.statusCode, result.data?.message)) {
          clearAuthCookie();
          setError("Session is invalid or expired. Please sign in again.");
          setLoading(false);
          router.replace("/login");
          return;
        }
        setError("Failed to validate session with server. Please refresh.");
        setLoading(false);
        return;
      }

      const summaryResult = await dashboardSummaryRequest(token);
      if (!summaryResult.ok) {
        setError(summaryResult.message || "Failed to load dashboard summary.");
      } else if (summaryResult.data) {
        setSummary(summaryResult.data);
      }

      setMe(result.data);
      setMetrics(readMetrics());
      setLoading(false);
    };

    run();
  }, [router]);

  return (
    <>
      <Topbar />
      <main>
        <div className="card">
          <h1>Dashboard</h1>
          {loading ? <p>Loading operational summary...</p> : null}
          {error ? <p className="error">{error}</p> : null}
          {!loading && !error ? (
            <>
              <p>Active login session.</p>
              <p>Name: {me?.user?.name || "-"}</p>
              <p>Email: {me?.user?.email || "-"}</p>
              <p>Role: {me?.user?.role || "-"}</p>
            </>
          ) : null}
        </div>

        {!loading ? (
          <div className="kpi-grid">
            <div className="card">
              <div>Total Reminders</div>
              <h2 style={{ margin: "8px 0 0" }}>{summary.total}</h2>
            </div>
            <div className="card">
              <div>Pending</div>
              <h2 style={{ margin: "8px 0 0", color: "#a16207" }}>{summary.pending}</h2>
            </div>
            <div className="card">
              <div>Sent</div>
              <h2 style={{ margin: "8px 0 0", color: "#166534" }}>{summary.terkirim}</h2>
            </div>
            <div className="card">
              <div>Failed</div>
              <h2 style={{ margin: "8px 0 0", color: "#b91c1c" }}>{summary.gagal}</h2>
            </div>
            <div className="card">
              <div>Skip</div>
              <h2 style={{ margin: "8px 0 0", color: "#475569" }}>{summary.skip}</h2>
            </div>
            <div className="card">
              <div>Sent Today</div>
              <h2 style={{ margin: "8px 0 0", color: "#0f766e" }}>{summary.today}</h2>
            </div>
            <div className="card">
              <div>Login Success (local)</div>
              <h2 style={{ margin: "8px 0 0" }}>{metrics.login_success || 0}</h2>
            </div>
            <div className="card">
              <div>Create Success/Fail (local)</div>
              <h2 style={{ margin: "8px 0 0" }}>
                {metrics.create_reminder_success || 0} / {metrics.create_reminder_failed || 0}
              </h2>
            </div>
          </div>
        ) : null}
      </main>
    </>
  );
}
