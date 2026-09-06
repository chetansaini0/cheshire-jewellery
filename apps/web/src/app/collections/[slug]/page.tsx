import { notFound } from "next/navigation";
import { collections } from "@cheshire/database/catalog";
import { catalog } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";

type Props = { params: Promise<{ slug: string }> };

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = collections.find((c) => c.slug === slug);
  if (!collection) notFound();
  const products = catalog.filter((p) => p.collection === slug);

  return (
    <div className="mx-auto max-w-site px-4 py-12 sm:px-6 lg:px-10">
      <h1 className="font-serif text-4xl md:text-5xl">{collection.name}</h1>
      <p className="mt-4 max-w-xl text-sm text-muted">{collection.description}</p>
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
