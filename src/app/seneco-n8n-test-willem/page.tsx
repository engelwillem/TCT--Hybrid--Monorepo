"use client";

import { useState, useEffect } from "react";

type Payload = Record<string, unknown>;

interface QaCase {
  name: string;
  expectedBranch: string;
  payload: Payload;
}

interface QaResult {
  name: string;
  expectedBranch: string;
  actualBranch: string;
  route: string;
  status: string;
  transport: string;
  httpStatus: number;
  pass: boolean;
}

const cases: QaCase[] = [
  {
    name: "HIGH priority",
    expectedBranch: "HIGH_PRIORITY",
    payload: { ticketId: "SUP-1001", customerName: "Willem Test User", email: "willem@test.com", department: "Billing", urgency: "HIGH", message: "I was charged twice and need urgent help." },
  },
  {
    name: "MEDIUM priority",
    expectedBranch: "MEDIUM_PRIORITY",
    payload: { ticketId: "SUP-1002", customerName: "Sarah Operations", email: "sarah@example.com", department: "Operations", urgency: "MEDIUM", message: "Please review this operational request." },
  },
  {
    name: "LOW priority",
    expectedBranch: "LOW_PRIORITY",
    payload: { ticketId: "SUP-1003", customerName: "Michael General", email: "michael@example.com", department: "General", urgency: "LOW", message: "I have a general question for later review." },
  },
  {
    name: "Missing email",
    expectedBranch: "VALIDATION_ERROR",
    payload: { ticketId: "SUP-1004", customerName: "Missing Email User", email: "", department: "Operations", urgency: "MEDIUM", message: "Need help checking this request." },
  },
  {
    name: "Empty message",
    expectedBranch: "VALIDATION_ERROR",
    payload: { ticketId: "SUP-1005", customerName: "Empty Message User", email: "empty@example.com", department: "General", urgency: "LOW", message: "" },
  },
  {
    name: "Routing fallback",
    expectedBranch: "ROUTING_ERROR_OR_LOW",
    payload: { ticketId: "SUP-1006", customerName: "Routing User", email: "routing@example.com", department: "Unknown", urgency: "ESCALATE_UNKNOWN", message: "This should test the routing fallback." },
  },
  {
    name: "Malformed input",
    expectedBranch: "VALIDATION_OR_SYSTEM_ERROR",
    payload: { unexpected: "shape" },
  },
];

function detectBranch(res: Record<string, unknown>) {
  const status = String(res.status || "");
  const route = String(res.route || "");
  if (status === "system_error" || route.includes("SYSTEM_ERROR")) return "SYSTEM_ERROR";
  if (status === "routing_error" || route.includes("ROUTING_ERROR")) return "ROUTING_ERROR";
  if (status === "validation_error" || route.includes("VALIDATION_ERROR")) return "VALIDATION_ERROR";
  if (route.includes("HIGH_PRIORITY")) return "HIGH_PRIORITY";
  if (route.includes("MEDIUM_PRIORITY")) return "MEDIUM_PRIORITY";
  if (route.includes("LOW_PRIORITY")) return "LOW_PRIORITY";
  return "UNKNOWN";
}

function passRule(expected: string, actual: string) {
  if (expected === "ROUTING_ERROR_OR_LOW") return actual === "ROUTING_ERROR" || actual === "LOW_PRIORITY";
  if (expected === "VALIDATION_OR_SYSTEM_ERROR") return actual === "VALIDATION_ERROR" || actual === "SYSTEM_ERROR";
  return expected === actual;
}

export default function SenecoDemoPage() {
  const [form, setForm] = useState({ ticketId: "SUP-1001", customerName: "", email: "", department: "", urgency: "HIGH", message: "" });
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qaResults, setQaResults] = useState<QaResult[]>([]);
  const [qaExpanded, setQaExpanded] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);

  const steps = [
    { key: "received", label: "Request received", check: (r: Record<string, unknown>) => !!r.traceId },
    { key: "cleaned", label: "Data cleaned", check: (r: Record<string, unknown>) => !!r.cleanedInput },
    { key: "validated", label: "Required fields validated", check: (r: Record<string, unknown>) => !!r.validation },
    { key: "priority", label: "Priority assigned", check: (r: Record<string, unknown>) => !!r.priority },
    { key: "routed", label: "Ticket routed", check: (r: Record<string, unknown>) => !!r.route },
    { key: "summary", label: "Summary generated", check: (r: Record<string, unknown>) => !!r.summary },
    { key: "final", label: "Final response created", check: (r: Record<string, unknown>) => !!r.finalCheckpoint },
  ];

  function loadExample(payload: Payload) {
    setForm({
      ticketId: String(payload.ticketId || "SUP-1001"),
      customerName: String(payload.customerName || ""),
      email: String(payload.email || ""),
      department: String(payload.department || ""),
      urgency: String(payload.urgency || "HIGH"),
      message: String(payload.message || ""),
    });
    setResult(null);
    setError(null);
  }

  async function submit() {
    setLoading(true);
    setError(null);
    setResult(null);
    setLoadingStep("received");

    try {
      const res = await fetch("/api/seneco-n8n-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      setLoadingStep("cleaned");
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect to automation backend");
    } finally {
      setLoading(false);
      setLoadingStep(null);
    }
  }

  async function runQA() {
    setQaExpanded(true);
    const rows: QaResult[] = [];
    for (const c of cases) {
      try {
        const res = await fetch("/api/seneco-n8n-test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(c.payload),
        });
        const data = await res.json();
        const actual = detectBranch(data);
        rows.push({
          name: c.name,
          expectedBranch: c.expectedBranch,
          actualBranch: actual,
          route: String(data.route || ""),
          status: String(data.status || ""),
          transport: String(data.transport || ""),
          httpStatus: res.status,
          pass: passRule(c.expectedBranch, actual) && res.status === 200,
        });
      } catch {
        rows.push({
          name: c.name,
          expectedBranch: c.expectedBranch,
          actualBranch: "ERROR",
          route: "",
          status: "error",
          transport: "failed",
          httpStatus: 0,
          pass: false,
        });
      }
    }
    setQaResults(rows);
  }

  const validation = result?.validation as Record<string, unknown> | undefined;
  const cleanedInput = result?.cleanedInput as Record<string, unknown> | undefined;
  const debug = result?.debug as Record<string, unknown> | undefined;
  const inputQuality = result?.inputQuality as Record<string, unknown> | undefined;

  const statusColor = result?.status === "success" ? "bg-emerald-500" : result?.status === "validation_error" ? "bg-amber-500" : result?.status === "routing_error" ? "bg-blue-500" : "bg-red-500";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">

        {/* HERO SECTION */}
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight">AI Support Request Triage Automation</h1>
          <p className="mx-auto mb-8 max-w-3xl text-lg text-slate-300">
            An n8n workflow demo that cleans messy support requests, validates required fields, assigns priority, routes the ticket, and returns a structured result.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium">Next.js Frontend</span>
            <span className="rounded-full bg-green-600 px-4 py-2 text-sm font-medium">API Route</span>
            <span className="rounded-full bg-purple-600 px-4 py-2 text-sm font-medium">n8n Workflow</span>
            <span className="rounded-full bg-slate-600 px-4 py-2 text-sm font-medium">Mock Data Only</span>
          </div>
        </section>

        {/* BUSINESS FLOW */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-center">Business Automation Flow</h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {["Customer Request", "Data Cleaning", "Validation", "Priority Routing", "Team Assignment", "Final Response"].map((step, i) => (
              <div key={step} className="flex items-center gap-4">
                <div className="rounded-xl bg-slate-800 px-6 py-4 text-center shadow-lg border border-slate-700">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Step {i + 1}
                  </div>
                  <div className="font-medium">{step}</div>
                </div>
                {i < 5 && <span className="text-slate-500 text-2xl">-&gt;</span>}
              </div>
            ))}
          </div>
        </section>

        {/* SUPPORT TICKET FORM */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-center">Support Ticket Intake</h2>
          <div className="mx-auto max-w-2xl rounded-2xl border border-slate-700 bg-slate-800/50 p-8 shadow-xl">
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Ticket ID</label>
                <input className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white" value={form.ticketId} onChange={(e) => setForm({...form, ticketId: e.target.value})} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Urgency</label>
                <select className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white" value={form.urgency} onChange={(e) => setForm({...form, urgency: e.target.value})}>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-slate-300">Customer Name</label>
              <input className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white" value={form.customerName} onChange={(e) => setForm({...form, customerName: e.target.value})} placeholder="Enter customer name" />
            </div>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
              <input className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="Enter email" />
            </div>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-slate-300">Department</label>
              <input className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white" value={form.department} onChange={(e) => setForm({...form, department: e.target.value})} placeholder="Enter department" />
            </div>
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-slate-300">Message</label>
              <textarea className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white h-24" value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} placeholder="Describe your issue" />
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={submit} disabled={loading} className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold hover:bg-emerald-500 disabled:opacity-50">
                {loading ? "Processing..." : "Submit Request"}
              </button>
              <button onClick={() => loadExample(cases[0].payload)} className="rounded-lg bg-blue-600 px-4 py-3 text-sm hover:bg-blue-500">HIGH Example</button>
              <button onClick={() => loadExample(cases[1].payload)} className="rounded-lg bg-blue-600 px-4 py-3 text-sm hover:bg-blue-500">MEDIUM Example</button>
              <button onClick={() => loadExample(cases[2].payload)} className="rounded-lg bg-blue-600 px-4 py-3 text-sm hover:bg-blue-500">LOW Example</button>
              <button onClick={() => loadExample(cases[3].payload)} className="rounded-lg bg-amber-600 px-4 py-3 text-sm hover:bg-amber-500">Missing Email</button>
              <button onClick={() => loadExample(cases[4].payload)} className="rounded-lg bg-amber-600 px-4 py-3 text-sm hover:bg-amber-500">Empty Message</button>
            </div>
          </div>
        </section>

        {/* ERROR PANEL */}
        {error && (
          <section className="mb-12">
            <div className="mx-auto max-w-2xl rounded-2xl border border-red-800 bg-red-900/30 p-6">
              <h3 className="mb-4 text-xl font-bold text-red-400">Backend Not Available</h3>
              <p className="mb-4 text-slate-300">{error}</p>
              <div className="text-sm text-slate-400">
                <p className="mb-2">Troubleshooting steps:</p>
                <ol className="list-inside list-decimal space-y-1">
                  <li>Is Next.js running on port 9002?</li>
                  <li>Is n8n running on port 5678?</li>
                  <li>Is the registered webhook URL configured?</li>
                  <li>Is the workflow active in n8n?</li>
                </ol>
              </div>
            </div>
          </section>
        )}

        {/* LIVE AUTOMATION PROGRESS */}
        {(loading || result) && (
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-center">Live Automation Progress</h2>
            <div className="mx-auto max-w-3xl grid grid-cols-2 gap-4 sm:grid-cols-4">
              {steps.map((step) => {
                const completed = result ? step.check(result) : loadingStep === step.key;
                return (
                  <div key={step.key} className={`rounded-xl p-4 text-center border-2 transition-all ${completed ? "border-emerald-500 bg-emerald-900/30" : "border-slate-700 bg-slate-800/30"}`}>
                    <div className={`mb-2 text-sm font-bold ${completed ? "text-emerald-400" : "text-slate-500"}`}>{completed ? "DONE" : "WAIT"}</div>
                    <div className={`text-sm font-medium ${completed ? "text-emerald-300" : "text-slate-400"}`}>{step.label}</div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* BEFORE VS AFTER */}
        {result && cleanedInput && (
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-center">Before vs After Data Cleaning</h2>
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-red-800/50 bg-red-900/20 p-6">
                <h3 className="mb-4 text-lg font-semibold text-red-400">Raw Submitted Input</h3>
                <div className="space-y-2 font-mono text-sm">
                  <div><span className="text-slate-400">email:</span> <span className="text-red-300">{form.email || "(empty)"}</span></div>
                  <div><span className="text-slate-400">customerName:</span> <span className="text-red-300">{form.customerName || "(empty)"}</span></div>
                  <div><span className="text-slate-400">message:</span> <span className="text-red-300">"{form.message || "(empty)"}"</span></div>
                  <div><span className="text-slate-400">department:</span> <span className="text-red-300">{form.department || "(empty)"}</span></div>
                </div>
              </div>
              <div className="rounded-xl border border-emerald-800/50 bg-emerald-900/20 p-6">
                <h3 className="mb-4 text-lg font-semibold text-emerald-400">Cleaned & Normalized</h3>
                <div className="space-y-2 font-mono text-sm">
                  <div><span className="text-slate-400">email:</span> <span className="text-emerald-300">{String(cleanedInput.email || "(empty)")} - lowercase</span></div>
                  <div><span className="text-slate-400">customerName:</span> <span className="text-emerald-300">{String(cleanedInput.customerName || "(empty)")} - trimmed</span></div>
                  <div><span className="text-slate-400">message:</span> <span className="text-emerald-300">"{String(cleanedInput.message || "(empty)")}" - trimmed</span></div>
                  <div><span className="text-slate-400">department:</span> <span className="text-emerald-300">{String(cleanedInput.department || "(empty)")} - uppercase</span></div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* DECISION & ROUTING */}
        {result && (
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-center">Decision & Routing Result</h2>
            <div className="mx-auto max-w-4xl">
              <div className={`mb-6 rounded-2xl ${statusColor} p-6 text-center text-2xl font-bold`}>
                Status: {String(result.status || "unknown").toUpperCase()}
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-center">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Priority</div>
                  <div className="text-sm text-slate-400">Priority</div>
                  <div className="text-xl font-bold">{String(result.priority || "-")}</div>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-center">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Team</div>
                  <div className="text-sm text-slate-400">Assigned Team</div>
                  <div className="text-xl font-bold">{String(result.assignedTeam || "-")}</div>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-center">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Route</div>
                  <div className="text-sm text-slate-400">Route</div>
                  <div className="text-sm font-bold">{String(result.route || "-")}</div>
                </div>
                {Array.isArray(validation?.missingFields) && validation.missingFields.length > 0 && (
                  <div className="rounded-xl border border-amber-800/50 bg-amber-900/20 p-4 text-center col-span-2 md:col-span-3">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">Validation</div>
                    <div className="text-sm text-slate-400">Missing Fields</div>
                    <div className="text-lg font-bold text-amber-300">{validation.missingFields.join(", ")}</div>
                  </div>
                )}
                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-center col-span-2 md:col-span-3">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Summary</div>
                  <div className="text-sm text-slate-400">Summary</div>
                  <div className="text-lg">{String(result.summary || "-")}</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* REQUIREMENT CHECKLIST */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-center">Technical Requirements Mapping</h2>
          <div className="mx-auto max-w-3xl grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-blue-800/50 bg-blue-900/20 p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">Trigger</span>
                <span className="font-bold text-blue-300">A trigger</span>
              </div>
              <div className="text-sm text-slate-300">Evidence: Webhook Trigger called through Next.js API route</div>
              <div className="mt-2 text-xs text-slate-500">Transport: {String(result?.transport || "pending")}</div>
            </div>
            <div className="rounded-xl border border-emerald-800/50 bg-emerald-900/20 p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Clean</span>
                <span className="font-bold text-emerald-300">Data cleaning / formatting</span>
              </div>
              <div className="text-sm text-slate-300">Evidence: Raw input vs cleanedInput (see Before/After section)</div>
              <div className="mt-2 text-xs text-slate-500">normalizedFields: {JSON.stringify(inputQuality?.normalizedFields || [])}</div>
            </div>
            <div className="rounded-xl border border-cyan-800/50 bg-cyan-900/20 p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Decision</span>
                <span className="font-bold text-cyan-300">Condition or decision</span>
              </div>
              <div className="text-sm text-slate-300">Evidence: IF Missing Required Data + Switch route</div>
              <div className="mt-2 text-xs text-slate-500">branch: {String(debug?.branch || "pending")}</div>
            </div>
            <div className="rounded-xl border border-purple-800/50 bg-purple-900/20 p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-purple-300">Code</span>
                <span className="font-bold text-purple-300">At least one Code node</span>
              </div>
              <div className="text-sm text-slate-300">Evidence: 7 Code nodes in workflow</div>
              <div className="mt-2 text-xs text-slate-500">nodeCheckpoint: {String(debug?.nodeCheckpoint || "pending")}</div>
            </div>
            <div className="rounded-xl border border-green-800/50 bg-green-900/20 p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-green-300">Output</span>
                <span className="font-bold text-green-300">Final output</span>
              </div>
              <div className="text-sm text-slate-300">Evidence: Final response with status, route, team, summary</div>
              <div className="mt-2 text-xs text-slate-500">finalCheckpoint: {String(result?.finalCheckpoint || "pending")}</div>
            </div>
            <div className="rounded-xl border border-amber-800/50 bg-amber-900/20 p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Missing</span>
                <span className="font-bold text-amber-300">Missing/incomplete data handling</span>
              </div>
              <div className="text-sm text-slate-300">Evidence: Missing email / empty message examples</div>
              <div className="mt-2 text-xs text-slate-500">missingFields: {JSON.stringify(validation?.missingFields || [])}</div>
            </div>
          </div>
        </section>

        {/* TECHNICAL ARCHITECTURE */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-center text-slate-400">Technical Architecture</h2>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="rounded bg-blue-700 px-3 py-2">Next.js Frontend</span>
            <span className="text-slate-500">-&gt;</span>
            <span className="rounded bg-green-700 px-3 py-2">Next.js API Route</span>
            <span className="text-slate-500">-&gt;</span>
            <span className="rounded bg-purple-700 px-3 py-2">n8n Webhook</span>
            <span className="text-slate-500">-&gt;</span>
            <span className="rounded bg-amber-700 px-3 py-2">Workflow Nodes</span>
            <span className="text-slate-500">-&gt;</span>
            <span className="rounded bg-emerald-700 px-3 py-2">JSON Response</span>
          </div>
        </section>

        {/* DEVELOPER QA EVIDENCE */}
        <section className="mb-12">
          <button
            onClick={() => setQaExpanded(!qaExpanded)}
            className="mx-auto mb-6 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-6 py-3 text-lg font-semibold hover:bg-slate-700"
          >
            <span>{qaExpanded ? "v" : ">"}</span>
            Developer QA Evidence {qaResults.length > 0 && `(${qaResults.filter(r => r.pass).length}/${qaResults.length} PASS)`}
          </button>

          {qaExpanded && (
            <div className="mx-auto max-w-5xl">
              <div className="mb-6 text-center">
                <button onClick={runQA} className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500">
                  Run Full QA Matrix
                </button>
              </div>

              {qaResults.length > 0 && (
                <>
                  <div className="mb-6 overflow-hidden rounded-xl border border-slate-700">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-800">
                        <tr>
                          <th className="p-3 text-left">Test</th>
                          <th className="p-3 text-left">Expected</th>
                          <th className="p-3 text-left">Actual</th>
                          <th className="p-3 text-left">Route</th>
                          <th className="p-3 text-center">HTTP</th>
                          <th className="p-3 text-left">Transport</th>
                          <th className="p-3 text-center">Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {qaResults.map((r, i) => (
                          <tr key={i} className={`border-t border-slate-700 ${r.pass ? "bg-emerald-900/20" : "bg-red-900/20"}`}>
                            <td className="p-3">{r.name}</td>
                            <td className="p-3">{r.expectedBranch}</td>
                            <td className={`p-3 font-semibold ${r.pass ? "text-emerald-400" : "text-red-400"}`}>{r.actualBranch}</td>
                            <td className="p-3 text-xs">{r.route}</td>
                            <td className="p-3 text-center">{r.httpStatus}</td>
                            <td className="p-3 text-xs">{r.transport}</td>
                            <td className={`p-3 text-center font-bold ${r.pass ? "text-emerald-400" : "text-red-400"}`}>{r.pass ? "PASS" : "FAIL"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Observability */}
                  {result && (
                    <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-6">
                      <h3 className="mb-4 text-lg font-semibold">Observability Data</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                        <div><span className="text-slate-400">traceId:</span> <span className="font-mono">{String(result.traceId || "-")}</span></div>
                        <div><span className="text-slate-400">durationMs:</span> {String(result.durationMs || "-")}</div>
                        <div><span className="text-slate-400">finalCheckpoint:</span> {String(result.finalCheckpoint || "-")}</div>
                        <div><span className="text-slate-400">nodeCheckpoint:</span> {String(debug?.nodeCheckpoint || "-")}</div>
                        <div><span className="text-slate-400">validation.isValid:</span> {String(validation?.isValid ?? "-")}</div>
                        <div><span className="text-slate-400">hasRequiredFields:</span> {String(inputQuality?.hasRequiredFields ?? "-")}</div>
                        <div><span className="text-slate-400">transport:</span> {String(result.transport || "-")}</div>
                        <div><span className="text-slate-400">integrityCheck:</span> {String(result.integrityCheck || "-")}</div>
                      </div>
                    </div>
                  )}

                  {/* Raw JSON */}
                  {result && (
                    <div className="mt-6 rounded-xl border border-slate-700 bg-slate-900 p-4">
                      <h3 className="mb-4 text-lg font-semibold">Raw JSON Response</h3>
                      <pre className="max-h-96 overflow-auto text-xs">{JSON.stringify(result, null, 2)}</pre>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
