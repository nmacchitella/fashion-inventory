// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Other Next.js configuration options can go here

  // 1. Ignore TypeScript build errors
  typescript: {
    // WARNING: This allows production builds to complete even if there are type errors.
    // Use this temporarily and ensure to fix type errors as soon as possible.
    ignoreBuildErrors: true,
  },

  // 2. Ignore ESLint errors during builds
  eslint: {
    // WARNING: This allows production builds to complete even if there are ESLint errors.
    // Use this temporarily and ensure to fix ESLint issues to maintain code quality.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
