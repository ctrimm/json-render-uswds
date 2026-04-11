import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Set NEXT_OUTPUT=export in CI to produce a static site (e.g. GitHub Pages).
  // Unset locally so API routes work during development.
  output: process.env.NEXT_OUTPUT === "export" ? "export" : undefined,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  images: { unoptimized: true },
  transpilePackages: ["@cdt5058/json-render-uswds"],
};

export default nextConfig;
