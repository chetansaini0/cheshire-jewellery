import { getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";

const map: Record<string, { title: string; max?: number; occasion?: string }> = {
  "for-her": { title: "For Her" },
  "for-him": { title: "For Him" },
  "for-yourself": { title: "For Yourself" },
  "under-999": { title: "Under ₹999", max: 999 },
  "under-1999": { title: "Under ₹1999", max: 1999 },
  premium: { title: "Premium Gifts" },
};

type Props = { params: Promise<{ slug: string }> };

export default async function GiftCategoryPage({ params }: Props) {
  const { slug } = await params;
  const meta = map[slug] || { title: "Gifts" };
  const products = getProducts({
    priceMax: meta.max ?? (slug === "premium" ? undefined : 4999),
    priceMin: slug === "premium" ? 3000 : undefined,
    pageSize: 16,
  }).data;

  return (
    <div className="mx-auto max-w-site px-4 py-12 sm:px-6 lg:px-10">
      <h1 className="font-serif text-4xl">{meta.title}</h1>
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
