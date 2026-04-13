import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'The Chosen Talks',
    short_name: 'TCT',
    description: 'Renungan harian, komunitas iman, dan perjalanan rohani bersama The Chosen Talks.',
    start_url: '/renungan',
    display: 'standalone',
    background_color: '#FAFCFF',
    theme_color: '#0F1A2E',
    orientation: 'portrait',
    categories: ['lifestyle', 'education', 'social'],
    lang: 'id',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
    ],
    shortcuts: [
      {
        name: 'Renungan Hari Ini',
        short_name: 'Renungan',
        url: '/renungan',
        description: 'Buka renungan harian',
        icons: [{ src: '/favicon.svg', sizes: 'any' }],
      },
      {
        name: 'Komunitas',
        short_name: 'Community',
        url: '/community',
        description: 'Lihat kiriman komunitas',
        icons: [{ src: '/favicon.svg', sizes: 'any' }],
      },
    ],
  };
}
