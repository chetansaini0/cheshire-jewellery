import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cheshire/database", "@cheshire/utils", "@cheshire/config"],
};

export default nextConfig;
