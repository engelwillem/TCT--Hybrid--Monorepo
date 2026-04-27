"use client";

export const RITUAL_STREAK_COMPLETED_KEY = "tct:renungan:completed-date";
const JAKARTA_TIMEZONE = "Asia/Jakarta";

export function getJakartaDateKey(date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: JAKARTA_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export function markRitualCompletedToday(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RITUAL_STREAK_COMPLETED_KEY, getJakartaDateKey());
  } catch {
    // Ignore storage issues (private mode/quota).
  }
}

export function isRitualCompletedToday(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(RITUAL_STREAK_COMPLETED_KEY) === getJakartaDateKey();
  } catch {
    return false;
  }
}
