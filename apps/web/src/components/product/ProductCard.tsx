"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@cheshire/types";
import { formatINR, getHoverImage, getPrimaryImage } from "@cheshire/utils";
import { useCommerceStore } from "@/store/commerce";
import { useUI } from "@/components/providers/UIProvider";
import { formatProductLabel } from "@/lib/catalog";

export function ProductCard({ product }: { product: Product }) {
  const addToCart = useCommerceStore((s) => s.addToCart);
  const toggleWishlist = useCommerceStore((s) => s.toggleWishlist);
  const wishlisted = useCommerceStore((s) => s.wishlistIds.includes(product.id));
  const { setCartOpen } = useUI();
  const primary = getPrimaryImage(product);
  const hover = getHoverImage(product);
  const affiliate = product.productType === "affiliate";
  const label = formatProductLabel(product.label || product.badge);
  const quickSizes = product.sizes.length > 1 ? product.sizes.slice(0, 5) : [];

  const quickAdd = (size?: string) => {
    addToCart(product, 1, size);
    setCartOpen(true);
  };

  return (
    <article className="group relative">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-line">
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
              className="object-cover opacity-0 transition duration-500 group-hover:opacity-100"
            />
          ) : null}
        </Link>

        {label ? (
          <span className="absolute left-2 top-2 rounded-full bg-gold px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-ink">
            {label}
          </span>
        ) : null}

        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => toggleWishlist(product.id)}
          className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-ivory/90 text-sm text-ink transition hover:bg-ivory ${
            wishlisted ? "text-sale" : ""
          }`}
        >
          {wishlisted ? "♥" : "♡"}
        </button>

        <div className="absolute inset-x-2 bottom-2 translate-y-3 rounded-lg bg-ivory/95 p-2 opacity-0 backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
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
                    className="min-w-8 rounded-md border border-ink/15 px-1.5 py-1 text-[10px] font-semibold text-ink transition hover:bg-ink hover:text-ivory"
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

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/products/${product.slug}`} className="block truncate text-[13px] font-semibold uppercase tracking-wide">
            {product.name}
          </Link>
          <p className="mt-0.5 truncate text-xs text-muted">{product.color}</p>
        </div>
        <div className="shrink-0 text-right text-[13px]">
          <p className="font-semibold">{formatINR(product.price)}</p>
          {product.mrp > product.price ? (
            <p className="text-xs text-muted line-through">{formatINR(product.mrp)}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
