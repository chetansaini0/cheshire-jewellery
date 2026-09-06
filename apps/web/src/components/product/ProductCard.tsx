"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@cheshire/types";
import { formatINR, getHoverImage, getPrimaryImage } from "@cheshire/utils";
import { useCommerceStore } from "@/store/commerce";
import { useUI } from "@/components/providers/UIProvider";

export function ProductCard({ product }: { product: Product }) {
  const addToCart = useCommerceStore((s) => s.addToCart);
  const toggleWishlist = useCommerceStore((s) => s.toggleWishlist);
  const wishlisted = useCommerceStore((s) => s.wishlistIds.includes(product.id));
  const { setCartOpen } = useUI();
  const primary = getPrimaryImage(product);
  const hover = getHoverImage(product);

  return (
    <article className="group relative" data-cursor="expand">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#ebe7df]">
        <Link href={`/products/${product.slug}`} className="block h-full w-full">
          <Image
            src={primary}
            alt={product.name}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-cover transition duration-700 ease-luxe group-hover:scale-[1.03]"
          />
          {hover ? (
            <Image
              src={hover}
              alt=""
              fill
              sizes="(max-width:768px) 50vw, 25vw"
              className="object-cover opacity-0 transition duration-700 ease-luxe group-hover:opacity-100"
            />
          ) : null}
        </Link>

        {product.badge ? (
          <span className="absolute left-3 top-3 border border-ink bg-ivory/90 px-2 py-1 text-[9px] tracking-[0.18em] uppercase">
            {product.badge}
          </span>
        ) : null}

        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => toggleWishlist(product.id)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center border border-ink/20 bg-ivory/90 text-sm transition hover:border-ink"
        >
          {wishlisted ? "♥" : "♡"}
        </button>

        <button
          type="button"
          onClick={() => {
            addToCart(product);
            setCartOpen(true);
          }}
          className="absolute inset-x-3 bottom-3 translate-y-2 bg-ink py-3 text-[10px] tracking-[0.18em] uppercase text-ivory opacity-0 transition duration-500 ease-luxe group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100"
          data-cursor="shop"
        >
          Quick Add
        </button>
      </div>

      <div className="mt-3 space-y-1">
        <Link href={`/products/${product.slug}`} className="block text-sm tracking-wide">
          {product.name}
        </Link>
        <p className="text-xs text-muted">
          {product.rating.toFixed(1)} · {product.reviewCount} reviews
        </p>
        <div className="flex items-baseline gap-2 text-sm">
          <span>{formatINR(product.price)}</span>
          {product.mrp > product.price ? (
            <>
              <span className="text-muted line-through">{formatINR(product.mrp)}</span>
              <span className="text-sale text-xs">{product.discountPercent}% off</span>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}
