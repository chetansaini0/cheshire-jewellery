import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getComplementary, youMayAlsoLike, catalog } from "@/lib/catalog";
import { getStorefrontProduct } from "@/lib/server-catalog";
import { ProductDetailClient } from "./ProductDetailClient";
import { breadcrumbJsonLd, organizationJsonLd, productJsonLd, productSeo } from "@cheshire/commerce";
import { seoDefaults } from "@cheshire/config";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return catalog.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getStorefrontProduct(slug);
  if (!product) return { title: "Product" };
  const seo = productSeo(product, process.env.NEXT_PUBLIC_SITE_URL || seoDefaults.siteUrl);
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonical },
    openGraph: seo.openGraph,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getStorefrontProduct(slug);
  if (!product) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || seoDefaults.siteUrl;
  const jsonLd = [
    productJsonLd(product, siteUrl),
    organizationJsonLd(siteUrl),
    breadcrumbJsonLd([
      { name: "Shop", url: `${siteUrl}/shop` },
      { name: product.category, url: `${siteUrl}/shop/${product.category}` },
      { name: product.name, url: `${siteUrl}/products/${product.slug}` },
    ]),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient
        product={product}
        pairWith={getComplementary(product)}
        alsoLike={youMayAlsoLike(product)}
      />
    </>
  );
}
