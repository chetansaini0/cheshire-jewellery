import type { MetadataRoute } from "next";
import { seoDefaults } from "@cheshire/config";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || seoDefaults.siteUrl;
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/checkout", "/account", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
