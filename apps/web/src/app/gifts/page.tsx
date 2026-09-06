import Link from "next/link";
import { giftCategories } from "@cheshire/config";
import { getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";

export default function GiftsPage() {
  const products = getProducts({ priceMax: 1999, pageSize: 8 }).data;
  return (
    <div className="mx-auto max-w-site px-4 py-12 sm:px-6 lg:px-10">
      <h1 className="font-serif text-4xl md:text-5xl">Gifts</h1>
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
        {giftCategories.map((g) => (
          <Link key={g.slug} href={g.href} className="border border-line px-4 py-8 text-center text-[11px] tracking-[0.16em] uppercase">
            {g.name}
          </Link>
        ))}
      </div>
      <h2 className="mt-14 font-serif text-3xl">Gift picks</h2>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
