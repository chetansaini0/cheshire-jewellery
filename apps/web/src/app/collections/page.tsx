import Link from "next/link";
import { collections } from "@cheshire/database/catalog";
import { getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";

export default function CollectionsPage() {
  return (
    <div className="mx-auto max-w-site px-4 py-12 sm:px-6 lg:px-10">
      <h1 className="font-serif text-4xl md:text-5xl">Collections</h1>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {collections.map((c) => (
          <Link key={c.slug} href={`/collections/${c.slug}`} className="border border-line p-8">
            <h2 className="font-serif text-3xl">{c.name}</h2>
            <p className="mt-3 text-sm text-muted">{c.description}</p>
          </Link>
        ))}
      </div>
      <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
        {getProducts({ sort: "bestselling", pageSize: 4 }).data.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
