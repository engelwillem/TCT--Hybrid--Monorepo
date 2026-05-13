import type {NextConfig} from 'next';

const isWindowsHost = process.platform === 'win32';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  // Keep production builds in-process only on native Windows hosts to avoid flaky worker failures.
  experimental: isWindowsHost
    ? {
        webpackBuildWorker: false,
        cpus: 4,
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
        source: '/library',
        destination: '/versehub/id',
        permanent: true,
      },
      {
        source: '/visitors',
        destination: '/community',
        permanent: true,
      },
      {
        source: '/gate-updates',
        destination: '/today',
        permanent: true,
      },
      {
        source: '/reflections/:path*',
        destination: '/community?intent=reflection',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
