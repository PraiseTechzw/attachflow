import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
  experimental: {
    // Enable React 19 features
    reactCompiler: false,
  },
  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // Enable React 19 strict mode
  reactStrictMode: true,
  // Enable modern bundling
  bundlePagesRouterDependencies: true,
  // Development server configuration
  ...(process.env.NODE_ENV === 'development' && {
    // Allow specific dev origins for development
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Access-Control-Allow-Origin',
              value: 'https://6000-firebase-studio-1767811365337.cluster-ikslh4rdsnbqsvu5nw3v4dqjj2.cloudworkstations.dev',
            },
          ],
        },
      ];
    },
  }),
};

export default nextConfig;
