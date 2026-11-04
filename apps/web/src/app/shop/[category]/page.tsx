import { Suspense } from "react";
import type { Metadata } from "next";
import type { CategorySlug } from "@cheshire/types";
import { categories } from "@cheshire/config";
import { ShopClient } from "../ShopClient";

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const title = categories.find((c) => c.slug === category)?.name ?? category.charAt(0).toUpperCase() + category.slice(1);
  return {
    title,
    description: `Shop ${title.toLowerCase()} at CHESHIRE. Roots. Remixed. Fusion wear for a Gen Z India.`,
  };
}

export default async function CategoryShopPage({ params }: Props) {
  const { category } = await params;
  return (
    <Suspense fallback={<div className="p-10 text-sm text-muted">Loading…</div>}>
      <ShopClient initialCategory={category as CategorySlug} />
    </Suspense>
  );
}
