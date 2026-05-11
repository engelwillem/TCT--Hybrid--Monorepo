import type {NextConfig} from 'next';

const isWindowsHost = process.platform === 'win32';
const communityBaseUrl =
  process.env.NEXT_PUBLIC_TCT_COMMUNITY_URL?.trim() || 'https://community.thechoosentalks.org';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  // Keep production builds in-process only on native Windows hosts to avoid flaky worker failures.
  experimental: isWindowsHost
    ? {
        webpackBuildWorker: false,
        cpus: 1,
      }
    : {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/renungan',
        destination: `${communityBaseUrl}/renungan`,
        permanent: true,
      },
      {
        source: '/today',
        destination: `${communityBaseUrl}/today`,
        permanent: true,
      },
      {
        source: '/community',
        destination: `${communityBaseUrl}/community`,
        permanent: true,
      },
      {
        source: '/community/:path*',
        destination: `${communityBaseUrl}/community/:path*`,
        permanent: true,
      },
      {
        source: '/versehub/:path*',
        destination: `${communityBaseUrl}/versehub/:path*`,
        permanent: true,
      },
      {
        source: '/paths/:path*',
        destination: `${communityBaseUrl}/paths/:path*`,
        permanent: true,
      },
      {
        source: '/profile/:path*',
        destination: `${communityBaseUrl}/profile/:path*`,
        permanent: true,
      },
      {
        source: '/library',
        destination: `${communityBaseUrl}/versehub/id`,
        permanent: true,
      },
      {
        source: '/visitors',
        destination: `${communityBaseUrl}/community`,
        permanent: true,
      },
      {
        source: '/gate-updates',
        destination: `${communityBaseUrl}/today`,
        permanent: true,
      },
      {
        source: '/reflections/:path*',
        destination: `${communityBaseUrl}/community?intent=reflection`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
