import Link from "next/link";
import type { Product } from "@cheshire/types";
import { ProductCard } from "@/components/product/ProductCard";

export function NewDrops({ products }: { products: Product[] }) {
  return (
    <section className="mx-auto max-w-site px-4 py-16 sm:px-6 lg:px-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Fresh this week</p>
          <h2 className="section-title mt-2">New arrivals</h2>
        </div>
        <Link href="/shop?sort=newest" className="link-arrow">Shop new</Link>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
