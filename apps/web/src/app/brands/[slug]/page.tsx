import { notFound } from "next/navigation";
import { getAffiliatePartners, getSuppliers } from "@cheshire/commerce";
import { getProductsByBrand } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";

type Props = { params: Promise<{ slug: string }> };

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const supplier = getSuppliers().find((s) => s.slug === slug);
  const partner = getAffiliatePartners().find((p) => p.slug === slug);
  const title = supplier?.brandName || partner?.name;
  if (!title) notFound();
  const products = getProductsByBrand(slug);

  return (
    <div className="mx-auto max-w-site px-4 py-12 sm:px-6 lg:px-10">
      <p className="text-[11px] tracking-[0.2em] uppercase text-muted">The edit</p>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl">{title}</h1>
      <p className="mt-4 max-w-xl text-sm text-muted">
        Selected for CHESHIRE. Photography, checkout, and care remain the CHESHIRE experience.
      </p>
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
