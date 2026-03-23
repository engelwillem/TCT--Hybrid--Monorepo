import Link from 'next/link';
import type { Metadata } from 'next';
import { TCTLogo } from '@/components/brand/TCTLogo';

export const metadata: Metadata = {
  title: 'The Chosen Talks',
  description: 'Ritual harian untuk menerima, merenung, dan berdoa.',
};

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#FAFCFF] flex flex-col items-center justify-center px-6 font-sans selection:bg-black/10">
      
      {/* Subtle texture */}
      <div className="pointer-events-none fixed inset-0 bg-[url('/grain.png')] opacity-[0.03] mix-blend-multiply" aria-hidden="true" />

      {/* Centered content — one viewport, no scroll */}
      <main className="relative z-10 flex flex-col items-center text-center w-full max-w-[340px]">
        
        {/* Brand — SVG logo + quiet text */}
        <div className="flex flex-col items-center mb-10 pt-4">
          <TCTLogo className="w-12 h-12 mb-5 drop-shadow-sm opacity-95" />
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-foreground/35">
            The Chosen Talks
          </p>
        </div>

        {/* Headline — one thought, not a pitch */}
        <h1 className="tct-serif text-[38px] leading-[1.15] tracking-tight text-foreground/90 mb-4">
          Mulai dari<br />hari ini.
        </h1>

        <p className="text-[15px] leading-[1.65] text-foreground/55 mb-12 font-medium">
          Terima firman, renungkan,<br />dan berdoa bersama.
        </p>

        {/* Primary CTA */}
        <Link
          href="/today"
          className="w-full max-w-[280px] rounded-full bg-foreground text-background py-[14px] text-[15px] font-semibold tracking-wide transition-all active:scale-[0.97] hover:opacity-90"
        >
          Lanjut sebagai Guest
        </Link>

        {/* Secondary — very quiet auth */}
        <div className="mt-8 flex items-center gap-4 text-[12px] text-foreground/40 font-medium">
          <Link href="/login?intent=signup" className="hover:text-foreground/70 transition-colors">Daftar</Link>
          <span aria-hidden="true" className="opacity-30">·</span>
          <Link href="/login" className="hover:text-foreground/70 transition-colors">Login</Link>
        </div>

      </main>
    </div>
  );
}
