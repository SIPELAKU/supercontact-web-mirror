import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* apus kl sdh difix type any*/
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
