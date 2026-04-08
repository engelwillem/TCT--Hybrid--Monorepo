import type { Metadata } from 'next';
import { LandingAuthLinks } from '@/app/LandingAuthLinks';
import { TrackedLink } from '@/components/analytics/TrackedLink';
import { TCTLogo } from '@/components/brand/TCTLogo';

export const metadata: Metadata = {
  title: 'Renungan Harian Kristen untuk Menerima Firman dan Berdoa',
  description: 'The Chosen Talks membantu Anda menerima firman, merenungkan ayat harian, dan bertumbuh bersama komunitas iman setiap hari.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'The Chosen Talks - Renungan Harian Kristen',
    description: 'Terima firman, renungkan ayat harian, dan bertumbuh bersama komunitas iman setiap hari.',
    images: [
      {
        url: '/api/og/home',
        width: 1200,
        height: 630,
        alt: 'The Chosen Talks - Renungan Harian',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Chosen Talks - Renungan Harian Kristen',
    description: 'Terima firman, renungkan ayat harian, dan bertumbuh bersama komunitas iman setiap hari.',
    images: ['/api/og/home'],
  },
};

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#FAFCFF] flex flex-col items-center justify-center px-6 font-sans selection:bg-black/10">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04] mix-blend-multiply"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(15,23,42,0.12) 1px, transparent 0)',
          backgroundSize: '18px 18px',
        }}
        aria-hidden="true"
      />

      <main className="relative z-10 flex w-full max-w-[340px] flex-col items-center py-12 text-center">
        <div className="mb-16 flex flex-col items-center pt-4">
          <TCTLogo className="mb-5 h-12 w-12 drop-shadow-sm opacity-95" />
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-foreground/35">
            The Chosen Talks
          </p>
        </div>

        <h1 className="tct-serif mb-6 text-[40px] leading-[1.1] tracking-tight text-foreground/90">
          Renungan harian
          <br />
          sebelum memulai hari.
        </h1>

        <p className="mb-14 text-[16px] font-medium italic leading-[1.6] text-foreground/55">
          Terima Firman, Renungkan ayat harian,
          <br />
          Berdoa & Diskusi Iman Dengan Komunitas.
        </p>

        <TrackedLink
          href="/renungan"
          eventName="landing_cta_click"
          surface="landing"
          meta={{ target: "/renungan" }}
          className="w-full max-w-[300px] rounded-full bg-black py-[17px] text-[16px] font-bold tracking-tight text-white shadow-2xl shadow-black/20 transition-all hover:bg-black/90 active:scale-[0.98]"
        >
          Lanjut ke Halaman Renungan
        </TrackedLink>

        <LandingAuthLinks />
      </main>
    </div>
  );
}
