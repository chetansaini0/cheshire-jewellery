import Link from "next/link";
import type { Product } from "@cheshire/types";
import { ProductCard } from "@/components/product/ProductCard";

export function NewDrops({ products }: { products: Product[] }) {
  return (
    <section className="mx-auto max-w-site px-4 py-16 sm:px-6 lg:px-10">
      <div className="flex items-end justify-between">
        <h2 className="font-serif text-4xl md:text-6xl">JUST DROPPED.</h2>
        <Link href="/shop?sort=newest" className="text-[11px] tracking-[0.18em] uppercase underline">
          Shop new
        </Link>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
