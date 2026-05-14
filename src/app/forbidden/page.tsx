import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-2xl items-center justify-center px-6 py-14">
      <section className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">403</p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Access denied</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          You are signed in, but your account does not have permission to access this page.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <Link
            href="/today"
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Go to Today
          </Link>
          <Link
            href="/profile"
            className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Open Profile
          </Link>
        </div>
      </section>
    </main>
  );
}

