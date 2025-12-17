import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* apus kl sdh difix type any*/
  eslint: {
    ignoreDuringBuilds: true,
  },
  // For development only - ignore SSL certificate errors
  ...(process.env.NODE_ENV === 'development' && {
    experimental: {
      serverComponentsExternalPackages: [],
    },
  }),
};

export default nextConfig;
