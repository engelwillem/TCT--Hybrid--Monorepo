"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Topbar } from "@/components/topbar";
import { clearAuthCookie, getAuthCookie } from "@/lib/auth";
import { deleteReminderRequest, meRequest, ReminderItem, remindersRequest } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { isAuthFailure } from "@/lib/session";

const STATUS_OPTIONS = ["", "Pending", "Sent", "Failed", "Skip"];

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

export default function RemindersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refreshKey = searchParams.get("refresh");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState<ReminderItem[]>([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<ReminderItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [role, setRole] = useState("unknown");
  const canManage = role !== "viewer";

  const canPrev = page > 1;
  const canNext = page < lastPage;
  const pageRef = useRef(1);

  const summaryText = useMemo(() => {
    if (total <= 0) return "No reminder data found.";
    const from = (page - 1) * perPage + 1;
    const to = Math.min(page * perPage, total);
    return `Showing ${from}-${to} of ${total} reminders`;
  }, [lastPage, page, perPage, total]);

  const loadData = async (targetPage: number) => {
    const token = getAuthCookie();
    if (!token) {
      router.replace("/login?next=/reminders");
      return;
    }

    setLoading(true);
    setError("");

    const result = await remindersRequest(token, {
      status: status || undefined,
      search: search || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      page: targetPage,
      per_page: perPage,
    });

    if (!result.ok) {
      if (isAuthFailure(result.statusCode, result.message)) {
        clearAuthCookie();
        setError(result.message || "Session is invalid or data cannot be loaded.");
        setLoading(false);
        router.replace("/login?next=/reminders");
        return;
      }
      setError(result.message || "Unable to load data. Please refresh.");
      setLoading(false);
      return;
    }

    setItems(result.items);
    setPage(result.page);
    pageRef.current = result.page;
    setPerPage(result.perPage);
    setTotal(result.total);
    setLastPage(result.lastPage);
    setLoading(false);
  };

  useEffect(() => {
    const resolveRole = async () => {
      const token = getAuthCookie();
      if (!token) return;
      const result = await meRequest(token);
      if (!result.ok) return;
      const userRole = String((result.data as { user?: { role?: string } })?.user?.role || "unknown").toLowerCase();
      setRole(userRole);
    };
    void resolveRole();
    loadData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  useEffect(() => {
    const refreshCurrentPage = () => {
      void loadData(pageRef.current || 1);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshCurrentPage();
      }
    };

    window.addEventListener("focus", refreshCurrentPage);
    window.addEventListener("pageshow", refreshCurrentPage);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("focus", refreshCurrentPage);
      window.removeEventListener("pageshow", refreshCurrentPage);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void loadData(pageRef.current || 1);
    }, 45000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onApplyFilters = async (e: FormEvent) => {
    e.preventDefault();
    await loadData(1);
  };

  const onConfirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    const token = getAuthCookie();
    if (!token) {
      router.replace("/login?next=/reminders");
      return;
    }

    setDeleting(true);
    setError("");

    const result = await deleteReminderRequest(token, String(deleteTarget.id));
    if (!result.ok) {
      if (isAuthFailure(result.statusCode, result.message)) {
        clearAuthCookie();
        router.replace("/login?next=/reminders");
        return;
      }
      setError(result.message || "Failed to delete reminder.");
      setDeleting(false);
      return;
    }

    setDeleteTarget(null);
    setDeleting(false);
    await loadData(page);
  };

  return (
    <>
      <Topbar />
      <main>
        <div className="card" style={{ marginBottom: 12 }}>
          <h1>Reminders</h1>
          <p>Monitor reminders with status filters, date range, and quick search.</p>
          <p>
            {canManage ? <Link className="link" href="/reminders/new">+ Create New Reminder</Link> : null}
          </p>

          <form onSubmit={onApplyFilters} className="stack" style={{ marginTop: 12 }}>
            <div className="grid-5">
              <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option || "All Statuses"}
                  </option>
                ))}
              </select>
              <input
                className="input"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="Date From"
              />
              <input
                className="input"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="Date To"
              />
              <input
                className="input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name / number"
              />
              <select className="input" value={perPage} onChange={(e) => setPerPage(Number(e.target.value))}>
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>

            <div className="actions-row">
              <button className="button" type="submit" style={{ width: "180px" }} disabled={loading}>
                {loading ? "Loading..." : "Apply Filters"}
              </button>
              <button
                className="button"
                type="button"
                style={{ width: "140px", background: "#475569" }}
                onClick={async () => {
                  setStatus("");
                  setSearch("");
                  setDateFrom("");
                  setDateTo("");
                  setPerPage(10);
                  await loadData(1);
                }}
                disabled={loading}
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        <div className="card">
          {error ? <p className="error">{error}</p> : null}
          <p>{summaryText}</p>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th align="left">ID</th>
                  <th align="left">Name</th>
                  <th align="left">No WA</th>
                  <th align="left">Status</th>
                  <th align="left">Scheduled At</th>
                  <th align="left">Sent At</th>
                  <th align="left">Message ID</th>
                  <th align="left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!loading && items.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: "12px 0" }}>
                      No data found.
                    </td>
                  </tr>
                ) : null}
                {items.map((item) => (
                  <tr key={String(item.id)}>
                    <td>{safeText(item.id)}</td>
                    <td>{safeText(item.customer_name)}</td>
                    <td>{safeText(item.phone)}</td>
                    <td>
                      <span className={statusClassName(item.status)}>{displayStatus(item.status)}</span>
                    </td>
                    <td>{safeText(item.scheduled_at)}</td>
                    <td>{safeText(item.sent_at)}</td>
                    <td>{safeText(item.fonnte_message_id)}</td>
                    <td>
                      <div className="actions-row">
                        <Link className="link" href={`/reminders/${item.id}`}>
                          Detail
                        </Link>
                        {canManage ? <Link className="link" href={`/reminders/${item.id}/edit`}>Edit</Link> : null}
                        {canManage ? (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            style={{
                              border: 0,
                              background: "transparent",
                              color: "#b91c1c",
                              cursor: "pointer",
                              padding: 0,
                              fontWeight: 600,
                            }}
                          >
                            Delete
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="actions-row" style={{ justifyContent: "space-between", marginTop: 12 }}>
            <button
              className="button"
              style={{ width: "140px", background: "#334155" }}
              disabled={loading || !canPrev}
              onClick={() => loadData(page - 1)}
            >
              Previous
            </button>
            <div style={{ alignSelf: "center" }}>
              Page {page} / {lastPage}
            </div>
            <button
              className="button"
              style={{ width: "140px", background: "#334155" }}
              disabled={loading || !canNext}
              onClick={() => loadData(page + 1)}
            >
              Next
            </button>
          </div>
        </div>

        {deleteTarget ? (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              zIndex: 40,
            }}
          >
            <div className="card" style={{ maxWidth: 460, width: "100%" }}>
              <h3 style={{ marginTop: 0 }}>Konfirmasi Delete</h3>
              <p style={{ marginBottom: 16 }}>
                Delete reminder untuk <strong>{safeText(deleteTarget.customer_name)}</strong> ({safeText(deleteTarget.phone)})?
              </p>
              <p style={{ marginTop: 0 }}>This action cannot be undone.</p>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <button
                  className="button"
                  type="button"
                  style={{ background: "#475569" }}
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="button"
                  type="button"
                  style={{ background: "#b91c1c" }}
                  onClick={onConfirmDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Ya, Delete"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </>
  );
}
