import type { Metadata } from 'next';
import TodayDailyRitualScreen from '@/features/today-ritual/components/TodayDailyRitualScreen';
import { loadTodaySessionContent } from '@/features/today-ritual/data/today-session.loader';

export const revalidate = 300;
export const metadata: Metadata = {
  title: 'Today',
  description: 'Ritual harian yang tenang untuk menerima, merefleksikan, dan berdoa.',
  openGraph: {
    title: 'Today — The Chosen Talks',
    description: 'Ritual harian yang tenang untuk menerima, merefleksikan, dan berdoa.',
    images: [
      {
        url: '/og/today-share.png',
        width: 1200,
        height: 630,
        alt: 'Today verse card — The Chosen Talks',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Today — The Chosen Talks',
    description: 'Ritual harian yang tenang untuk menerima, merefleksikan, dan berdoa.',
    images: ['/og/today-share.png'],
  },
};

type TodayPageProps = {
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
};

function normalizePreviewDate(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const trimmed = raw.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}

export default async function TodayPage({ searchParams }: TodayPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const previewDate = normalizePreviewDate(resolvedSearchParams?.previewDate);

  const sessionContent = await loadTodaySessionContent({ previewDate });

  return <TodayDailyRitualScreen sessionContent={sessionContent} />;
}
