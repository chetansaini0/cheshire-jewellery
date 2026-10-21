import Link from "next/link";
import type { Product } from "@cheshire/types";
import { ProductCard } from "@/components/product/ProductCard";

export function Bestsellers({ products }: { products: Product[] }) {
  return (
    <section className="bg-ink py-16 text-ivory lg:py-24">
      <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-gold">Most wanted</p>
            <h2 className="section-title mt-2">Selling fast</h2>
          </div>
          <Link href="/shop?sort=bestselling" className="link-arrow">See all</Link>
        </div>
      </div>
      <div className="no-scrollbar mt-8 flex snap-x gap-4 overflow-x-auto px-4 sm:px-6 lg:px-10">
        {products.map((p) => (
          <div key={p.id} className="w-[62vw] shrink-0 snap-start sm:w-[38vw] md:w-[24vw] xl:w-[19vw] [&_p]:text-ivory/60">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
