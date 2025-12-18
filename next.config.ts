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
  
  // Config lainnya...
  ...(process.env.NODE_ENV === 'development' && {
    experimental: {
      serverComponentsExternalPackages: [],
    },
  }),
};

export default nextConfig;