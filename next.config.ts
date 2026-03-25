import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  experimental: {
    // Keep production builds in-process on Windows to avoid flaky worker failures.
    webpackBuildWorker: false,
    cpus: 1,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
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
