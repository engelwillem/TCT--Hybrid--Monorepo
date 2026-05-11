import type { Metadata } from "next";

const GOOGLE_SHEET_URL =
  process.env.NEXT_PUBLIC_TCT_WA_SHEET_URL?.trim() || "https://docs.google.com/spreadsheets/";

export const metadata: Metadata = {
  title: "WA Reminder Google Sheet",
  description: "WA reminder workflow using Google Sheet.",
};

export default function WaReminderPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Website 02</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">WA Reminder Google Sheet</h1>
        <p className="mt-4 text-sm text-slate-600">
          This portfolio module uses Google Sheet as the operational source.
        </p>

        <a
          href={GOOGLE_SHEET_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Open Google Sheet
        </a>
      </div>
    </main>
  );
}

