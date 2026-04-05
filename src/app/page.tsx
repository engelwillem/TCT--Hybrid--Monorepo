import Link from 'next/link';
import type { Metadata } from 'next';
import { TCTLogo } from '@/components/brand/TCTLogo';
import { TrackedLink } from '@/components/analytics/TrackedLink';

export const metadata: Metadata = {
  title: 'Renungan Harian Kristen untuk Menerima Firman dan Berdoa',
  description: 'The Chosen Talks membantu Anda menerima firman, merenungkan ayat harian, dan bertumbuh bersama komunitas iman setiap hari.',
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#FAFCFF] flex flex-col items-center justify-center px-6 font-sans selection:bg-black/10">
      
      {/* Subtle texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04] mix-blend-multiply"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(15,23,42,0.12) 1px, transparent 0)',
          backgroundSize: '18px 18px',
        }}
        aria-hidden="true"
      />

      {/* Centered content — one viewport, no scroll */}
      <main className="relative z-10 flex flex-col items-center text-center w-full max-w-[340px] py-12">
        
        {/* Brand — SVG logo + quiet text */}
        <div className="flex flex-col items-center mb-16 pt-4">
          <TCTLogo className="w-12 h-12 mb-5 drop-shadow-sm opacity-95" />
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-foreground/35">
            The Chosen Talks
          </p>
        </div>

        {/* Headline — one thought, not a pitch */}
        <h1 className="tct-serif text-[40px] leading-[1.1] tracking-tight text-foreground/90 mb-6">
          Renungan harian<br />
          sebelum memulai hari.
        </h1>

        <p className="text-[16px] leading-[1.6] text-foreground/55 mb-14 font-medium italic">
          Terima Firman, Renungkan ayat harian,<br />
          Berdoa & Diskusi Iman Dengan Komunitas.
        </p>

        {/* Primary CTA */}
        <TrackedLink
          href="/renungan"
          eventName="landing_cta_click"
          surface="landing"
          meta={{ target: "/renungan" }}
          className="w-full max-w-[300px] rounded-full bg-black text-white py-[17px] text-[16px] font-bold tracking-tight shadow-2xl shadow-black/20 transition-all active:scale-[0.98] hover:bg-black/90"
        >
          Lanjut ke Halaman Renungan
        </TrackedLink>

        {/* Secondary — very quiet auth */}
        <div className="mt-10 flex items-center gap-6 text-[13px] text-foreground/40 font-medium pb-20">
          <Link href="/login?intent=signup" className="hover:text-foreground/70 transition-colors">Daftar</Link>
          <span aria-hidden="true" className="opacity-30">·</span>
          <Link href="/login" className="hover:text-foreground/70 transition-colors">Login</Link>
        </div>

      </main>
    </div>
  );
}
