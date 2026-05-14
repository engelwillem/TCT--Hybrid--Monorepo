import type { Metadata } from 'next';
import { LandingAuthLinks } from '@/app/LandingAuthLinks';
import { TrackedLink } from '@/components/analytics/TrackedLink';
import { TCTLogo } from '@/components/brand/TCTLogo';
import LandingAnimationShell from '@/app/LandingAnimationShell';

export const metadata: Metadata = {
  title: 'Daily Christian Reflection for Scripture and Prayer',
  description: 'Start your day with living Scripture. Receive a verse, reflect on its meaning, and grow with The Chosen Talks faith community.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'The Chosen Talks — Daily Christian Reflection',
    description: 'Start your day with living Scripture. Receive a verse, reflect on its meaning, and grow in faith every day.',
    images: [
      {
        url: '/api/og/home',
        width: 1200,
        height: 630,
        alt: 'The Chosen Talks — Daily Reflection',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Chosen Talks — Daily Christian Reflection',
    description: 'Start your day with living Scripture. Receive a verse, reflect on its meaning, and grow in faith every day.',
    images: ['/api/og/home'],
  },
};

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#FAFCFF] flex flex-col items-center justify-center px-6 font-sans selection:bg-black/10">
      {/* Subtle dot grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04] mix-blend-multiply"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(15,23,42,0.12) 1px, transparent 0)',
          backgroundSize: '18px 18px',
        }}
        aria-hidden="true"
      />

      {/* Large background watermark T. */}
      <div
        className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <span
          className="select-none text-[40vw] font-black text-foreground/[0.018] leading-none tracking-tighter"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          T.
        </span>
      </div>

      <LandingAnimationShell>
        <main className="relative z-10 flex w-full max-w-[340px] flex-col items-center py-12 text-center">
          {/* Logo block — animates first */}
          <div
            data-animate="logo"
            className="mb-16 flex flex-col items-center pt-4"
          >
            <TCTLogo className="mb-5 h-12 w-12 drop-shadow-sm opacity-95" />
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-foreground/35">
              The Chosen Talks
            </p>
          </div>

          {/* Headline — animates second */}
          <h1
            data-animate="headline"
            className="tct-serif mb-5 text-[40px] leading-[1.1] tracking-tight text-foreground/90"
          >
            Daily reflection
            <br />
            before your day begins.
          </h1>

          {/* Tagline — animates third */}
          <p
            data-animate="tagline"
            className="mb-14 text-[16px] font-medium italic leading-[1.6] text-foreground/55"
          >
            Receive the Word, reflect on today&apos;s verse,
            <br />
            Pray &amp; discuss your faith with the community.
          </p>

          {/* CTA — animates fourth */}
          <div data-animate="cta" className="w-full flex flex-col items-center gap-4">
            <TrackedLink
              href="/renungan"
              eventName="landing_cta_click"
              surface="landing"
              meta={{ target: '/renungan' }}
              className="w-full max-w-[300px] rounded-full bg-black py-[17px] text-[16px] font-bold tracking-tight text-white shadow-2xl shadow-black/20 transition-all hover:bg-black/90 active:scale-[0.98]"
            >
              Start Today&apos;s Reflection
            </TrackedLink>

            <LandingAuthLinks />
          </div>
        </main>
      </LandingAnimationShell>
    </div>
  );
}
