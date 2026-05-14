"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Topbar } from "@/components/topbar";
import { clearAuthCookie, getAuthCookie } from "@/lib/auth";
import { meRequest, reminderDetailRequest, ReminderItem, reminderLogsRequest, ReminderLogItem } from "@/lib/api";
import { isAuthFailure } from "@/lib/session";

function safeText(value: unknown): string {
  if (value === null || value === undefined) return "-";
  const text = String(value).trim();
  return text === "" ? "-" : text;
}

function displayStatus(value: unknown): string {
  const text = String(value || "").trim().toLowerCase();
  if (text === "terkirim") return "Sent";
  if (text === "gagal") return "Failed";
  if (text === "pending") return "Pending";
  if (text === "skip") return "Skip";
  return safeText(value);
}

function statusClassName(status: unknown): string {
  const text = String(status || "").trim().toLowerCase();
  if (text === "pending") return "status-badge status-pending";
  if (text === "terkirim") return "status-badge status-terkirim";
  if (text === "gagal") return "status-badge status-gagal";
  if (text === "skip") return "status-badge status-skip";
  return "status-badge";
}

export default function ReminderDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const reminderId = String(params?.id || "");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [item, setItem] = useState<ReminderItem | null>(null);
  const [relatedHistory, setRelatedHistory] = useState<ReminderLogItem[]>([]);
  const [historyNote, setHistoryNote] = useState("History diambil dari endpoint log reminder.");
  const loadingRef = useRef(false);
  const [role, setRole] = useState("viewer");
  const canManage = role === "admin" || role === "operator";

  const loadDetail = async () => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      const token = getAuthCookie();
      if (!token) {
        loadingRef.current = false;
        router.replace(`/login?next=/reminders/${reminderId}`);
        return;
      }

      const detail = await reminderDetailRequest(token, reminderId);
      const me = await meRequest(token);
      if (me.ok) {
        const userRole = String((me.data as { user?: { role?: string } })?.user?.role || "viewer").toLowerCase();
        setRole(userRole);
      }
      if (!detail.ok || !detail.data) {
        if (isAuthFailure(detail.statusCode, detail.message)) {
          clearAuthCookie();
          loadingRef.current = false;
          router.replace(`/login?next=/reminders/${reminderId}`);
          return;
        }

        setError(detail.message || "Failed to load reminder details.");
        setLoading(false);
        loadingRef.current = false;
        return;
      }

      setItem(detail.data);
      const historyResult = await reminderLogsRequest(token, reminderId);
      if (historyResult.ok) {
        setRelatedHistory(historyResult.logs);
      } else {
        setHistoryNote("History is not available from backend yet.");
      }

      setLoading(false);
      loadingRef.current = false;
    };

  useEffect(() => {
    if (reminderId) {
      void loadDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminderId, router]);

  useEffect(() => {
    const refreshDetail = () => {
      if (document.visibilityState !== "visible") return;
      void loadDetail();
    };

    window.addEventListener("focus", refreshDetail);
    window.addEventListener("pageshow", refreshDetail);
    document.addEventListener("visibilitychange", refreshDetail);
    return () => {
      window.removeEventListener("focus", refreshDetail);
      window.removeEventListener("pageshow", refreshDetail);
      document.removeEventListener("visibilitychange", refreshDetail);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminderId]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void loadDetail();
    }, 45000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminderId]);

  return (
    <>
      <Topbar />
      <main>
        <div className="card form-layout-responsive">
          <h1>Reminder Details</h1>
          <p>Reminder details, delivery status, and latest message payload.</p>

          {loading ? <p>Loading reminder details...</p> : null}
          {!loading && error ? <p className="error">{error}</p> : null}

          {!loading && !error && item ? (
            <div className="stack" style={{ marginTop: 12 }}>
              <div>
                <strong>ID</strong>
                <div>{safeText(item.id)}</div>
              </div>
              <div>
                <strong>Customer Name</strong>
                <div>{safeText(item.customer_name)}</div>
              </div>
              <div>
                <strong>No WhatsApp</strong>
                <div>{safeText(item.phone)}</div>
              </div>
              <div className="grid-3">
                <div>
                  <strong>Date</strong>
                  <div>{safeText(item.tanggal)}</div>
                </div>
                <div>
                  <strong>Time</strong>
                  <div>{safeText(item.jam)}</div>
                </div>
                <div>
                  <strong>Time Zone</strong>
                  <div>{safeText(item.zona_waktu)}</div>
                </div>
              </div>
              <div>
                <strong>Timezone</strong>
                <div>{safeText(item.timezone)}</div>
              </div>
              <div>
                <strong>Scheduled At</strong>
                <div>{safeText(item.scheduled_at)}</div>
              </div>
              <div>
                <strong>Sent At</strong>
                <div>{safeText(item.sent_at)}</div>
              </div>
              <div>
                <strong>Status</strong>
                <div><span className={statusClassName(item.status)}>{displayStatus(item.status)}</span></div>
              </div>
              <div>
                <strong>Fonnte Message ID</strong>
                <div>{safeText(item.fonnte_message_id)}</div>
              </div>
              <div>
                <strong>Store Name</strong>
                <div>{safeText(item.toko)}</div>
              </div>
              <div>
                <strong>Message Template</strong>
                <div style={{ whiteSpace: "pre-wrap" }}>{safeText(item.message_template)}</div>
              </div>

              <div className="card" style={{ background: "#f8fafc", borderColor: "#cbd5e1" }}>
                <strong>Related History</strong>
                <div style={{ marginTop: 8, fontSize: 12, color: "#334155" }}>{historyNote}</div>
                <div className="table-wrap" style={{ marginTop: 10 }}>
                  <table className="data-table" style={{ minWidth: 620 }}>
                    <thead>
                      <tr>
                        <th align="left">Log ID</th>
                        <th align="left">Status</th>
                        <th align="left">Scheduled At</th>
                        <th align="left">Sent At</th>
                        <th align="left">Message ID</th>
                        <th align="left">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatedHistory.length === 0 ? (
                        <tr>
                          <td colSpan={6}>No related history yet.</td>
                        </tr>
                      ) : (
                        relatedHistory.map((entry) => (
                          <tr key={entry.id}>
                            <td>{safeText(entry.id)}</td>
                            <td><span className={statusClassName(entry.status)}>{displayStatus(entry.status)}</span></td>
                            <td>{safeText(entry.scheduled_at)}</td>
                            <td>{safeText(entry.sent_at)}</td>
                            <td>{safeText(entry.fonnte_message_id)}</td>
                            <td>{safeText(entry.reason)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}

          <div className="actions-row" style={{ marginTop: 16 }}>
            <Link className="link" href="/reminders">
              Back to List
            </Link>
            {item && canManage ? (
              <Link className="link" href={`/reminders/${item.id}/edit`}>
                Edit Reminder
              </Link>
            ) : null}
          </div>
        </div>
      </main>
    </>
  );
}
