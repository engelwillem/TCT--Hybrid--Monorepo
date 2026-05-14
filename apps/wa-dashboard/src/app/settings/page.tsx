"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/topbar";
import { clearAuthCookie, getAuthCookie } from "@/lib/auth";
import { meRequest, settingsRequest, updateSettingsRequest } from "@/lib/api";
import { isAuthFailure } from "@/lib/session";

export default function SettingsPage() {
  const router = useRouter();
  const [role, setRole] = useState("unknown");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const [demoMax, setDemoMax] = useState("10");
  const [demoAllowlist, setDemoAllowlist] = useState("");
  const canManage = role === "admin";

  const load = async () => {
    const token = getAuthCookie();
    if (!token) {
      router.replace("/login?next=/settings");
      return;
    }
    setLoading(true);
    const [me, settings] = await Promise.all([meRequest(token), settingsRequest(token)]);
    if (me.ok) {
      const userRole = String((me.data as { user?: { role?: string } })?.user?.role || "unknown").toLowerCase();
      setRole(userRole);
      if (userRole !== "admin") {
        setError("Only admins can change settings.");
      }
    }
    if (!settings.ok) {
      if (isAuthFailure(settings.statusCode, settings.message)) {
        clearAuthCookie();
        router.replace("/login?next=/settings");
        return;
      }
      setError(settings.message || "Failed to load settings.");
      setLoading(false);
      return;
    }
    const data = settings.data || {};
    setDemoMode(Boolean(data.demo_mode));
    setDemoMax(String(data.demo_max_reminders || 10));
    setDemoAllowlist(Array.isArray(data.demo_allowed_numbers) ? data.demo_allowed_numbers.join(", ") : "");
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canManage) return;
    const token = getAuthCookie();
    if (!token) return;
    setError("");
    setSuccess("");
    const payload = {
      demo_mode: demoMode,
      demo_max_reminders: Number(demoMax || 10),
      demo_allowed_numbers: demoAllowlist
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    };
    const result = await updateSettingsRequest(token, payload);
    if (!result.ok) {
      setError(result.message || "Failed to save settings.");
      return;
    }
    setSuccess("Settings saved successfully.");
  };

  return (
    <>
      <Topbar />
      <main>
        <div className="card form-layout-responsive">
          <h1>WA Settings</h1>
          <p>Control demo mode and operational guardrails.</p>
          {loading ? <p>Loading settings...</p> : null}
          {error ? <p className="error">{error}</p> : null}
          {success ? <p style={{ color: "#166534" }}>{success}</p> : null}

          {!loading ? (
            <form onSubmit={onSubmit} className="stack" style={{ marginTop: 12 }}>
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="checkbox" checked={demoMode} onChange={(e) => setDemoMode(e.target.checked)} disabled={!canManage} />
                Enable Demo Mode
              </label>
              <input
                className="input"
                placeholder="Maximum demo reminders"
                value={demoMax}
                onChange={(e) => setDemoMax(e.target.value)}
                disabled={!canManage}
              />
              <textarea
                className="input"
                style={{ minHeight: 100 }}
                placeholder="Demo number allowlist, separated by commas"
                value={demoAllowlist}
                onChange={(e) => setDemoAllowlist(e.target.value)}
                disabled={!canManage}
              />
              <button className="button" style={{ maxWidth: 220 }} disabled={!canManage}>
                Save Settings
              </button>
            </form>
          ) : null}
        </div>
      </main>
    </>
  );
}
