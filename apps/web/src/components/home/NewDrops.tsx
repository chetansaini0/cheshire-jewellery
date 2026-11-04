import Link from "next/link";
import type { Product } from "@cheshire/types";
import { SectionHeading } from "@cheshire/ui";
import { ProductCard } from "@/components/product/ProductCard";

export function NewDrops({
  products,
  eyebrow = "New in",
  title = "Fresh this season",
  href = "/new-in",
  linkLabel = "Shop new in",
}: {
  products: Product[];
  eyebrow?: string;
  title?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <section className="mx-auto max-w-site px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
      <div className="flex items-end justify-between gap-4">
        <SectionHeading eyebrow={eyebrow} title={title} />
        <Link href={href} className="link-arrow">
          {linkLabel}
        </Link>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
