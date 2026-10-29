import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
  transpilePackages: ["@cheshire/database", "@cheshire/utils", "@cheshire/config", "@cheshire/commerce", "@cheshire/types", "@cheshire/integrations"],
};

export default nextConfig;
