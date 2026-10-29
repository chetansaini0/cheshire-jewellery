import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  transpilePackages: [
    "@cheshire/ui",
    "@cheshire/utils",
    "@cheshire/config",
    "@cheshire/types",
    "@cheshire/api-client",
    "@cheshire/database",
    "@cheshire/commerce",
    "@cheshire/integrations",
  ],
};

export default nextConfig;
