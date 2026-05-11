import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AI Workflow Operating System Case Study',
  description: 'Case study for an AI workflow operating system with prompt architecture, SOPs, compliance checks, and automation playbooks.',
};

const modules = [
  'Workflow discovery and process mapping',
  'Prompt templates for repeatable AI outputs',
  'SOP and documentation generator',
  'Compliance checklist assistant',
  'Automation backlog prioritisation',
  'Reusable integration playbooks',
] as const;

export default function AiKnowledgeOsCaseStudyPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100 md:px-10 md:py-16">
      <section className="mx-auto max-w-5xl rounded-3xl border border-slate-800 bg-slate-900 p-7 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Portfolio Case Study</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">AI Workflow Operating System</h1>
        <p className="mt-5 text-base leading-8 text-slate-300">
          A structured operating layer for turning messy business processes into documented, repeatable, AI-assisted automations.
          It is designed for teams that need strategy, implementation, governance, and operational handoff in one system.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {modules.map((item) => (
            <div key={item} className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">{item}</div>
          ))}
        </div>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-950 p-6">
          <h2 className="text-2xl font-semibold">Business value</h2>
          <p className="mt-3 leading-8 text-slate-300">
            This system shows strategic automation thinking: audit the current process, find bottlenecks, design a better workflow,
            then implement AI, API, and dashboard layers with documentation and reliability controls.
          </p>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-200" href="/aios">Open demo dashboard</Link>
          <Link className="rounded-xl border border-slate-600 px-5 py-3 text-sm font-bold hover:bg-slate-800" href="/">Back home</Link>
        </div>
      </section>
    </main>
  );
}
