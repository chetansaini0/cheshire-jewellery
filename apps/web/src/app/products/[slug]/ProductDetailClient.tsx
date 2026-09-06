"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@cheshire/types";
import { formatINR, getPrimaryImage } from "@cheshire/utils";
import { ProductCard } from "@/components/product/ProductCard";
import { useCommerceStore } from "@/store/commerce";
import { useUI } from "@/components/providers/UIProvider";

export function ProductDetailClient({
  product,
  pairWith,
  alsoLike,
}: {
  product: Product;
  pairWith: Product[];
  alsoLike: Product[];
}) {
  const [size, setSize] = useState(product.sizes[0] || "One Size");
  const [active, setActive] = useState(0);
  const [openAcc, setOpenAcc] = useState<string | null>("DESCRIPTION");
  const addToCart = useCommerceStore((s) => s.addToCart);
  const toggleWishlist = useCommerceStore((s) => s.toggleWishlist);
  const wishlisted = useCommerceStore((s) => s.wishlistIds.includes(product.id));
  const trackView = useCommerceStore((s) => s.trackView);
  const recentlyViewed = useCommerceStore((s) => s.recentlyViewed);
  const { setCartOpen } = useUI();

  useEffect(() => {
    trackView(product.id);
  }, [product.id, trackView]);

  const images = product.images;
  const sections = [
    { id: "DESCRIPTION", body: product.description },
    { id: "MATERIAL", body: product.material },
    { id: "DIMENSIONS", body: product.dimensions || "See size chart" },
    { id: "CARE", body: product.care || "" },
    { id: "SHIPPING", body: product.shippingInfo || "" },
    { id: "RETURNS", body: product.returnsInfo || "" },
    { id: "WARRANTY", body: product.warranty || "" },
  ];

  return (
    <div className="mx-auto max-w-site px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="relative aspect-[4/5] overflow-hidden bg-[#ebe7df]">
            <Image
              src={images[active]?.url || getPrimaryImage(product)}
              alt={product.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 50vw"
            />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActive(i)}
                className={`relative aspect-square overflow-hidden border ${
                  active === i ? "border-ink" : "border-transparent"
                }`}
              >
                <Image src={img.url} alt="" fill className="object-cover" sizes="120px" />
              </button>
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          {product.badge ? (
            <p className="text-[11px] tracking-[0.18em] uppercase text-muted">{product.badge}</p>
          ) : null}
          <h1 className="mt-2 font-serif text-4xl md:text-5xl">{product.name}</h1>
          <p className="mt-3 text-sm text-muted">
            {product.rating.toFixed(1)} · {product.reviewCount} reviews
          </p>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-xl">{formatINR(product.price)}</span>
            {product.mrp > product.price ? (
              <>
                <span className="text-muted line-through">{formatINR(product.mrp)}</span>
                <span className="text-sale text-sm">{product.discountPercent}% off</span>
              </>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-muted">
            {product.stock > 0 ? "In stock — ships in 24–48 hrs" : "Currently unavailable"}
          </p>

          <div className="mt-8">
            <p className="text-[11px] tracking-[0.16em] uppercase">Size</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`min-w-12 border px-3 py-2 text-sm ${
                    size === s ? "border-ink bg-ink text-ivory" : "border-line"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="bg-ink py-4 text-[11px] tracking-[0.18em] uppercase text-ivory"
              data-cursor="shop"
              onClick={() => {
                addToCart(product, 1, size);
                setCartOpen(true);
              }}
            >
              Add to Cart
            </button>
            <Link
              href="/checkout"
              onClick={() => addToCart(product, 1, size)}
              className="border border-ink py-4 text-center text-[11px] tracking-[0.18em] uppercase"
              data-cursor="shop"
            >
              Buy Now
            </Link>
          </div>
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            className="mt-3 text-sm underline"
          >
            {wishlisted ? "Saved to wishlist" : "Add to wishlist"}
          </button>

          <div className="mt-10 divide-y divide-line border-y border-line">
            {sections.map((s) => (
              <div key={s.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between py-4 text-left text-[11px] tracking-[0.16em] uppercase"
                  onClick={() => setOpenAcc(openAcc === s.id ? null : s.id)}
                  aria-expanded={openAcc === s.id}
                >
                  {s.id}
                  <span>{openAcc === s.id ? "−" : "+"}</span>
                </button>
                {openAcc === s.id ? (
                  <p className="pb-4 text-sm leading-relaxed text-muted">{s.body}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="mt-20">
        <h2 className="font-serif text-3xl md:text-4xl">Pair it with</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {pairWith.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-serif text-3xl md:text-4xl">You may also like</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {alsoLike.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {recentlyViewed.length > 1 ? (
        <section className="mt-16">
          <h2 className="font-serif text-3xl md:text-4xl">Recently viewed</h2>
          <p className="mt-2 text-sm text-muted">Synced locally — cloud sync via account API.</p>
        </section>
      ) : null}

      {/* Mobile sticky ATC */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ivory p-3 lg:hidden">
        <button
          type="button"
          className="w-full bg-ink py-3 text-[11px] tracking-[0.18em] uppercase text-ivory"
          onClick={() => {
            addToCart(product, 1, size);
            setCartOpen(true);
          }}
        >
          Add to Cart · {formatINR(product.price)}
        </button>
      </div>
    </div>
  );
}
