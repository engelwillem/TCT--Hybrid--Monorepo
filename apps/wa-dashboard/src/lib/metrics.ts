type MetricKey =
  | "login_success"
  | "create_reminder_success"
  | "create_reminder_failed"
  | "invalid_phone_input"
  | "invalid_placeholder_input";

const STORAGE_KEY = "wa_dashboard_metrics_v1";

export function trackMetric(key: MetricKey) {
  if (typeof window === "undefined") return;
  try {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Record<string, number>;
    current[key] = Number(current[key] || 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // ignore metrics errors
  }
}

export function readMetrics(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Record<string, number>;
  } catch {
    return {};
  }
}
