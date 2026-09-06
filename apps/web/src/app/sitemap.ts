import type { MetadataRoute } from "next";
import { catalog } from "@/lib/catalog";
import { seoDefaults } from "@cheshire/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || seoDefaults.siteUrl;
  const staticRoutes = ["", "/shop", "/gifts", "/about", "/stores", "/support", "/stylist", "/journal", "/collections"].map(
    (path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
    })
  );
  const products = catalog.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: new Date(p.updatedAt),
  }));
  return [...staticRoutes, ...products];
}
