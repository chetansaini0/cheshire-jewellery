"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@cheshire/types";
import { formatINR, getHoverImage, getPrimaryImage } from "@cheshire/utils";
import { useCommerceStore } from "@/store/commerce";
import { useUI } from "@/components/providers/UIProvider";
import { Badge } from "@cheshire/ui";
import { displayName } from "@/lib/display";

export function ProductCard({ product }: { product: Product }) {
  const addToCart = useCommerceStore((s) => s.addToCart);
  const toggleWishlist = useCommerceStore((s) => s.toggleWishlist);
  const wishlisted = useCommerceStore((s) => s.wishlistIds.includes(product.id));
  const { setCartOpen } = useUI();
  const primary = getPrimaryImage(product);
  const hover = getHoverImage(product);
  const affiliate = product.productType === "affiliate";
  const name = displayName(product.name);
  const isNew = product.isNew || product.badge === "NEW" || product.label === "NEW";
  const quickSizes = product.sizes.length > 1 ? product.sizes.slice(0, 5) : [];

  const quickAdd = (size?: string) => {
    addToCart(product, 1, size);
    setCartOpen(true);
  };

  return (
    <article className="group relative">
      <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-card">
        <Link href={`/products/${product.slug}`} className="block h-full w-full">
          <Image
            src={primary}
            alt={name}
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
              className="object-cover opacity-0 transition duration-500 group-hover:opacity-100"
            />
          ) : null}
        </Link>

        {isNew ? <Badge className="absolute left-2.5 top-2.5">New</Badge> : null}

        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => toggleWishlist(product.id)}
          className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-ivory/90 text-sm text-ink opacity-90 transition hover:bg-ivory hover:text-gold ${
            wishlisted ? "text-sale" : ""
          }`}
        >
          {wishlisted ? "♥" : "♡"}
        </button>

        <div className="absolute inset-x-2 bottom-2 translate-y-3 rounded-sm bg-ivory/95 p-2 opacity-0 shadow-soft backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
          {affiliate ? (
            <Link href={`/products/${product.slug}`} className="block py-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-ink">
              View item
            </Link>
          ) : quickSizes.length ? (
            <div>
              <p className="text-center text-[9px] font-semibold uppercase tracking-[0.16em] text-muted">Quick add</p>
              <div className="mt-1.5 flex justify-center gap-1">
                {quickSizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => quickAdd(s)}
                    className="min-w-8 rounded-sm border border-line px-1.5 py-1 text-[10px] font-semibold text-ink transition hover:bg-ink hover:text-ivory"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => quickAdd(product.sizes[0])} className="w-full py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink">
              Quick add
            </button>
          )}
        </div>
      </div>

      <div className="mt-3.5 space-y-1">
        <Link href={`/products/${product.slug}`} className="block truncate font-serif text-[19px] font-medium leading-tight transition hover:text-gold">
          {name}
        </Link>
        <p className="flex items-baseline gap-2 text-[13px]">
          <span className="font-semibold">{formatINR(product.price)}</span>
          {product.mrp > product.price ? <span className="text-xs text-muted line-through">{formatINR(product.mrp)}</span> : null}
        </p>
      </div>
    </article>
  );
}
