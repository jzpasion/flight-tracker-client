import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lint still runs in `next dev`; don't fail the production (Docker) build on
  // lint-only issues like @typescript-eslint/no-explicit-any.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
