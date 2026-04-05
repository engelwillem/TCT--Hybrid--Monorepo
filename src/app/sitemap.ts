import type { MetadataRoute } from 'next';
import { getPrimarySiteUrl } from '@/lib/seo';

const SITE_URL = getPrimarySiteUrl();

function buildUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: buildUrl('/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: buildUrl('/renungan'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: buildUrl('/versehub/id'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: buildUrl('/community'),
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: buildUrl('/channels'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.75,
    },
    {
      url: buildUrl('/paths'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: buildUrl('/legal/privacy'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: buildUrl('/legal/terms'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];
}
