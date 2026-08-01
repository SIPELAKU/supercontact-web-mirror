/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Bypass Error ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 2. Bypass Error TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },

  // 3. Image optimization settings
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com', // fallback wildcard
        port: '',
        pathname: '/**',
      },
    ],
  },

  // 4. Custom headers for CORS (if needed)
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
  // D2 (Data Intelligence UI/UX revamp): Company Search, its Results page,
  // Saved Companies, and the Lists index/detail pages were merged into one
  // "Companies" workspace (Discover/Saved/Lists tabs). Old bookmarks/links
  // still resolve instead of 404ing.
  async redirects() {
    return [
      {
        source: '/data-intelligence/industry-leaders',
        destination: '/data-intelligence/companies?tab=discover',
        permanent: false,
      },
      {
        source: '/data-intelligence/industry-leaders/results',
        destination: '/data-intelligence/companies?tab=discover',
        permanent: false,
      },
      {
        source: '/data-intelligence/company-intelligence',
        destination: '/data-intelligence/companies?tab=saved',
        permanent: false,
      },
      {
        source: '/data-intelligence/lists',
        destination: '/data-intelligence/companies?tab=lists',
        permanent: false,
      },
      {
        source: '/data-intelligence/lists/:id',
        destination: '/data-intelligence/companies?tab=lists&list=:id',
        permanent: false,
      },
    ];
  },
  //comment utk dev purpose need to be reverted back
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
      return []
      // console.warn('⚠️ WARNING: BACKEND_URL is not set. Proxy rewrites might fail.');
    }

    return [
      {
        source: '/api/proxy/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;