import type { Metadata } from 'next';
import { TrackedLink } from '@/components/analytics/TrackedLink';
import { TCTLogo } from '@/components/brand/TCTLogo';
import LandingAnimationShell from '@/app/LandingAnimationShell';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const PRODUCTION_BASE_URL = 'https://www.thechoosentalks.org';

function resolvePortfolioUrl(envValue: string | undefined, localPath: string): string {
  const trimmed = envValue?.trim();
  if (trimmed) return trimmed;
  return IS_PRODUCTION ? `${PRODUCTION_BASE_URL}${localPath}` : localPath;
}

const COMMUNITY_APP_URL =
  resolvePortfolioUrl(process.env.NEXT_PUBLIC_TCT_COMMUNITY_URL, '/portfolio1');
const WA_REMINDER_APP_URL =
  resolvePortfolioUrl(process.env.NEXT_PUBLIC_TCT_WA_URL, '/portfolio2');
const AIOS_APP_URL =
  resolvePortfolioUrl(process.env.NEXT_PUBLIC_TCT_AIOS_URL, '/portfolio3');

export const metadata: Metadata = {
  title: 'Portfolio Website - The Chosen Talks',
  description: 'Portfolio website showcasing digital products: The Chosen Talks Community, WA Reminder Google Sheet, and AIOS Financial Advisory.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Portfolio Website - The Chosen Talks',
    description: 'Explore products I have built: The Chosen Talks Community, WA Reminder Google Sheet, and AIOS Financial Advisory.',
    images: [
      {
        url: '/api/og/home',
        width: 1200,
        height: 630,
        alt: 'Portfolio Website - The Chosen Talks',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portfolio Website - The Chosen Talks',
    description: 'Portfolio website showcasing digital products I have built.',
    images: ['/api/og/home'],
  },
};

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-6 py-16 font-sans selection:bg-black/10">
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
        <main className="relative z-10 flex w-full max-w-[760px] flex-col items-center py-8 text-center">
          {/* Logo block — animates first */}
          <div
            data-animate="logo"
            className="mb-12 flex flex-col items-center pt-4"
          >
            <TCTLogo className="mb-5 h-12 w-12 drop-shadow-sm opacity-95" />
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-foreground/35">
              The Chosen Talks
            </p>
          </div>

          {/* Headline — animates second */}
          <h1
            data-animate="headline"
            className="tct-serif mb-4 text-[38px] leading-[1.1] tracking-tight text-foreground/90 md:text-[44px]"
          >
            Portfolio Website
          </h1>

          {/* Tagline — animates third */}
          <p
            data-animate="tagline"
            className="mb-10 text-[16px] font-medium italic leading-[1.6] text-foreground/55 md:text-[17px]"
          >
            A curated collection of digital products I built:
            <br />
            community, automation, and AI systems.
          </p>

          <div data-animate="cta" className="grid w-full gap-4 text-left md:grid-cols-3">
            <TrackedLink
              href={COMMUNITY_APP_URL}
              eventName="landing_cta_click"
              surface="landing"
              meta={{ target: COMMUNITY_APP_URL, product: 'community_renungan' }}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Website 01</p>
              <h2 className="mb-2 text-[18px] font-bold text-slate-900">Community The Chosen Talks</h2>
              <p className="text-[13px] leading-relaxed text-slate-600">
                Daily reflection before your day starts, faith-based journaling, and community interaction.
              </p>
            </TrackedLink>

            <TrackedLink
              href={WA_REMINDER_APP_URL}
              eventName="landing_cta_click"
              surface="landing"
              meta={{ target: WA_REMINDER_APP_URL, product: 'wa_reminder_google_sheet' }}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Website 02</p>
              <h2 className="mb-2 text-[18px] font-bold text-slate-900">WA Reminder Google Sheet</h2>
              <p className="text-[13px] leading-relaxed text-slate-600">
                Google Sheet-powered reminder automation with scheduled processing and operations monitoring.
              </p>
            </TrackedLink>

            <TrackedLink
              href={AIOS_APP_URL}
              eventName="landing_cta_click"
              surface="landing"
              meta={{ target: AIOS_APP_URL, product: 'aios_financial_advisory' }}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Website 03</p>
              <h2 className="mb-2 text-[18px] font-bold text-slate-900">AIOS Financial Advisory</h2>
              <p className="text-[13px] leading-relaxed text-slate-600">
                AI workflow automation for onboarding, operational integrations, and wealth management observability.
              </p>
            </TrackedLink>
          </div>

          <TrackedLink
            href="/portfolio3"
            eventName="landing_cta_click"
            surface="landing"
            meta={{ target: "/portfolio3", product: "aios_kpi_demo" }}
            className="mt-4 inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Open AIOS KPI Demo Dashboard
          </TrackedLink>

          <p data-animate="tagline" className="mt-8 text-[12px] text-slate-500">
            This main domain is the portfolio hub. Community runs on a dedicated subdomain.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500">
            <span className="rounded-full border border-slate-300 bg-white/70 px-3 py-1">Laravel</span>
            <span className="rounded-full border border-slate-300 bg-white/70 px-3 py-1">Next.js</span>
            <span className="rounded-full border border-slate-300 bg-white/70 px-3 py-1">Automation Workflows</span>
            <span className="rounded-full border border-slate-300 bg-white/70 px-3 py-1">OpenAI API</span>
          </div>
        </main>
      </LandingAnimationShell>
    </div>
  );
}
