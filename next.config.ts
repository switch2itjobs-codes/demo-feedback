import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  experimental: {
    turbopack: {
      // Ensure the project root is the web folder when multiple lockfiles exist
      root: __dirname,
    },
  },
};

export default nextConfig;
