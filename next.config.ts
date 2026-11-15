import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  /**
   * PGlite is the local-development database only; production connects to
   * real Postgres through `postgres` (see src/db/index.ts). It is a wasm
   * package that pulls in optional native deps such as `ws`, and the bundler
   * traces into it from the dynamic import even though that branch never runs
   * when DATABASE_URL is set — which fails the build with
   * "Can't resolve 'ws'". Keeping it external leaves the import alone.
   */
  serverExternalPackages: ['@electric-sql/pglite'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: '**.spekeapartments.com' }],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
};

export default nextConfig;
