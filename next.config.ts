import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required: @excalidraw/excalidraw is an ES Module-only package
  // Next.js cannot process it during SSR without this
  transpilePackages: ["@excalidraw/excalidraw"],
  devIndicators: false
};

export default nextConfig;
