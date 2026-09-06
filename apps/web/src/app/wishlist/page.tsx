"use client";

import Link from "next/link";
import { catalog } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";
import { useCommerceStore } from "@/store/commerce";

export default function WishlistPage() {
  const ids = useCommerceStore((s) => s.wishlistIds);
  const items = catalog.filter((p) => ids.includes(p.id));

  return (
    <div className="mx-auto max-w-site px-4 py-12 sm:px-6 lg:px-10">
      <h1 className="font-serif text-4xl md:text-5xl">Wishlist</h1>
      {items.length === 0 ? (
        <p className="mt-6 text-muted">
          Nothing saved yet.{" "}
          <Link href="/shop" className="underline">
            Explore the catalogue
          </Link>
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
