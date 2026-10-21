import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cheshire/database", "@cheshire/utils", "@cheshire/config", "@cheshire/commerce", "@cheshire/types", "@cheshire/integrations"],
};

export default nextConfig;
