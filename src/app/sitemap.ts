import type { MetadataRoute } from 'next';
import { getPrimarySiteUrl } from '@/lib/seo';

const SITE_URL = getPrimarySiteUrl();
const LEGAL_LAST_MODIFIED = new Date('2025-01-15T00:00:00.000Z');

function startOfUtcDay(date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function startOfUtcWeek(date = new Date()): Date {
  const day = date.getUTCDay();
  const normalizedDay = day === 0 ? 7 : day;
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - (normalizedDay - 1));
  return start;
}

function buildUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const today = startOfUtcDay();
  const weekStart = startOfUtcWeek(today);

  return [
    {
      url: buildUrl('/'),
      lastModified: weekStart,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: buildUrl('/renungan'),
      lastModified: today,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: buildUrl('/versehub/id'),
      lastModified: today,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: buildUrl('/community'),
      lastModified: today,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: buildUrl('/channels'),
      lastModified: weekStart,
      changeFrequency: 'daily',
      priority: 0.75,
    },
    {
      url: buildUrl('/journey'),
      lastModified: weekStart,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: buildUrl('/legal/privacy'),
      lastModified: LEGAL_LAST_MODIFIED,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: buildUrl('/legal/terms'),
      lastModified: LEGAL_LAST_MODIFIED,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];
}
