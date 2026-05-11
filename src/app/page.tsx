import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AI Automation Portfolio | Financial Advisory Systems',
  description:
    'Portfolio website for AI automation, workflow integration, dashboards, and financial advisory operations systems.',
};

const cases = [
  {
    label: 'Case 01',
    title: 'Client Onboarding Automation',
    body: 'Lead intake, fact-find collection, AI client summaries, advisor prep notes, CRM updates, and follow-up tasks.',
    href: '/portfolio/ai-client-onboarding',
  },
  {
    label: 'Case 02',
    title: 'Operations & KPI Dashboard',
    body: 'Executive visibility for automation runs, queue status, failed jobs, integration health, SLA risk, and retries.',
    href: '/portfolio/operations-dashboard',
  },
  {
    label: 'Case 03',
    title: 'AI Workflow Operating System',
    body: 'Structured AI layer for prompt workflows, process mapping, SOPs, compliance checks, and reusable automation playbooks.',
    href: '/portfolio/ai-knowledge-os',
  },
] as const;

const signals = [
  'Zapier / Make / n8n style workflow design',
  'OpenAI workflow orchestration',
  'APIs, webhooks, CRM and calendar integrations',
  'Dashboards for leadership visibility',
  'Secure, documented, production-style systems',
  'Financial advisory automation use cases',
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100 md:px-10 md:py-16">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-cyan-400/20 bg-slate-900/80 p-7 shadow-2xl shadow-cyan-950/30 md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">AI Automation Specialist Portfolio</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
            Automation systems for financial advisory, operations, and executive visibility.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
            This portfolio is built to match senior AI automation roles: workflow mapping, AI-assisted operations,
            API integrations, dashboards, queue visibility, and reliable documentation for real business processes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-200" href="/aios">
              Open Live Demo Dashboard
            </Link>
            <Link className="rounded-xl border border-slate-600 px-5 py-3 text-sm font-bold text-slate-100 hover:bg-slate-800" href="/readme">
              View Technical README
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {cases.map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{item.label}</p>
              <h2 className="mt-3 text-2xl font-semibold">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.body}</p>
              <Link className="mt-5 inline-flex rounded-lg border border-cyan-400/40 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/10" href={item.href}>
                View case study
              </Link>
            </article>
          ))}
        </div>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-2xl font-semibold">Role fit checklist</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {signals.map((signal) => (
              <div key={signal} className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
                {signal}
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
