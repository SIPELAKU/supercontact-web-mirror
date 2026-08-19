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

  // Keeps icon-library imports tree-shaken per-icon instead of pulling in
  // the full barrel module when a component imports from the package root.
  experimental: {
    optimizePackageImports: ['@mui/icons-material', 'lucide-react'],
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
      // The embeddable widget bundle lives at a STABLE, version-agnostic path
      // (/widget.js) - every tenant's <script src=".../widget.js"> points at
      // it, so we must NOT rename or content-hash it (that would break every
      // existing embed). Instead cache it briefly and force revalidation, so a
      // deploy is picked up within ~5 minutes without a hard cache bust.
      // NOTE: for the same reason we deliberately do NOT add Subresource
      // Integrity (SRI) to the embed snippet - the asset is mutable, so a
      // pinned hash would break on every deploy.
      {
        source: '/widget.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=300, must-revalidate' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
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
      // D3: the standalone org-chart drill-down page was folded into the
      // Company 360 profile's "People & Org" tab.
      {
        source: '/data-intelligence/company/:id/org-chart',
        destination: '/data-intelligence/company/:id?tab=people-org',
        permanent: false,
      },
      // D4: Individual -> People (renamed, reworked from a card grid into
      // a table with company backlinks and a seniority signal).
      {
        source: '/data-intelligence/individual',
        destination: '/data-intelligence/people',
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