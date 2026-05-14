"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuthCookie, getAuthCookie } from "@/lib/auth";
import { logoutRequest, meRequest } from "@/lib/api";
import { isAuthFailure } from "@/lib/session";

export function Topbar() {
  const router = useRouter();
  const [role, setRole] = useState("unknown");
  const canManage = role !== "viewer";

  useEffect(() => {
    const run = async () => {
      const token = getAuthCookie();
      if (!token) return;
      const result = await meRequest(token);
      if (!result.ok) return;
      const nextRole = String((result.data as { user?: { role?: string } })?.user?.role || "unknown").toLowerCase();
      setRole(nextRole);
    };
    void run();
  }, []);

  const onLogout = async () => {
    const token = getAuthCookie();
    if (token) {
      const result = await logoutRequest(token);
      if (!result.ok && isAuthFailure(result.statusCode, result.message)) {
        clearAuthCookie();
      }
    }
    clearAuthCookie();
    router.replace("/login");
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <strong>WA Dashboard</strong>
        <nav className="nav-links">
          <Link className="link" href="/dashboard">
            Dashboard
          </Link>
          <Link className="link" href="/reminders">
            Reminders
          </Link>
          {canManage ? <Link className="link" href="/reminders/new">Create New</Link> : null}
          {canManage ? <Link className="link" href="/templates">Templates</Link> : null}
          {role === "admin" || role === "unknown" ? <Link className="link" href="/settings">Settings</Link> : null}
          <button className="button" style={{ width: "auto", padding: "8px 12px" }} onClick={onLogout}>
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
