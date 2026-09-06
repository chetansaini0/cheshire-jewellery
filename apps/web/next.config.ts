import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
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
  ],
};

export default nextConfig;
