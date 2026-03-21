import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Paths',
  description: 'Perjalanan spiritual bertahap untuk bertumbuh setiap hari.',
};

export default function PathsPage() {
  return (
    <div className="flex flex-col px-2 md:px-0 pt-6 pb-24 max-w-[420px]">

      {/* Page label */}
      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/30 mb-10">
        Paths
      </p>

      {/* Section entry — intentional, not apologetic */}
      <div className="space-y-3 mb-14">
        <h1 className="tct-serif text-[30px] leading-[1.2] text-foreground/90 tracking-tight">
          Perjalanan rohani<br />yang terarah.
        </h1>
        <p className="text-[15px] leading-[1.65] text-foreground/50 font-medium">
          Rangkaian refleksi bertahap untuk membantu<br />pertumbuhan iman yang konsisten.
        </p>
      </div>

      {/* Season marker — not "coming soon", but "right now, start here" */}
      <div className="border-t border-black/[0.06] pt-8 mb-8">
        <p className="text-[13px] font-semibold text-foreground/70 mb-2">
          Mulai dari hari ini.
        </p>
        <p className="text-[13px] leading-[1.7] text-foreground/40 font-medium">
          Ritual harian adalah langkah pertama yang paling<br />nyata dalam pertumbuhan rohani.
          Paths baru sedang<br />disiapkan untuk menemani langkah berikutnya.
        </p>
      </div>

      {/* Primary CTA — back to where the growth actually happens */}
      <Link
        href="/today"
        className="inline-flex items-center justify-center rounded-full bg-foreground text-background py-[13px] px-6 text-[14px] font-semibold tracking-wide transition-all active:scale-[0.97] hover:opacity-90 self-start"
      >
        Kembali ke Today
      </Link>

      {/* Secondary — quiet community link */}
      <p className="mt-8 text-[12px] text-foreground/30 font-medium">
        Ingin berbagi perjalanan rohani hari ini?{' '}
        <Link
          href="/community"
          className="text-foreground/50 hover:text-foreground/70 transition-colors underline underline-offset-4 decoration-foreground/20"
        >
          Buka Community
        </Link>
      </p>

    </div>
  );
}
