import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    // Prevent Next from inferring an incorrect monorepo root when multiple lockfiles exist.
    // Using process.cwd() is safe here because `next build` runs with cwd = this `web/` folder.
    root: process.cwd(),
  },
};

export default nextConfig;
