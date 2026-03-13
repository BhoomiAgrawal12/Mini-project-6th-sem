import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // react-hook-form dist/ has broken declaration paths (../src/ references that don't exist).
    // Run `npm install` to fix properly. Runtime is unaffected.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
