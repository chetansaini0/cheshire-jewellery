import type { Product } from "@cheshire/types";

export function productSeo(product: Product, siteUrl = "https://www.cheshire.com") {
  const title = product.seoTitle || `${product.name} · CHESHIRE`;
  const description =
    product.seoDescription ||
    product.shortDescription ||
    `${product.name} in ${product.material}. Streetwear and clothing from CHESHIRE.`;
  const canonical = `${siteUrl.replace(/\/$/, "")}/products/${product.slug}`;
  return {
    title,
    description,
    canonical,
    openGraph: {
      title: product.name,
      description,
      url: canonical,
      images: product.images.map((i) => ({ url: i.url, alt: i.alt })),
    },
  };
}

export function productJsonLd(product: Product, siteUrl = "https://www.cheshire.com") {
  const availability =
    (product.stock ?? 0) > 0 && product.availability !== "out_of_stock"
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: product.images.map((i) => i.url),
    brand: { "@type": "Brand", name: product.brandName || "CHESHIRE" },
    material: product.material,
    offers: {
      "@type": "Offer",
      url: `${siteUrl.replace(/\/$/, "")}/products/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      availability,
    },
    aggregateRating:
      product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          }
        : undefined,
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function organizationJsonLd(siteUrl = "https://www.cheshire.com") {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CHESHIRE Clothing",
    url: siteUrl,
    slogan: "More than moments.",
  };
}
