import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  },
  
  // Config lainnya...
  ...(process.env.NODE_ENV === 'development' && {
    experimental: {
      serverComponentsExternalPackages: [],
    },
  }),
};

export default nextConfig;