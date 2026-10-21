"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@cheshire/types";
import { formatINR, getPrimaryImage } from "@cheshire/utils";
import { ProductCard } from "@/components/product/ProductCard";
import { useCommerceStore } from "@/store/commerce";
import { useUI } from "@/components/providers/UIProvider";
import { catalog, formatProductLabel } from "@/lib/catalog";
import { TrustBadges } from "@/components/product/TrustBadges";
import { isAffiliateProduct } from "@cheshire/commerce";

export function ProductDetailClient({
  product,
  pairWith,
  alsoLike,
}: {
  product: Product;
  pairWith: Product[];
  alsoLike: Product[];
}) {
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null);
  const [sizeError, setSizeError] = useState(false);
  const [active, setActive] = useState(0);
  const [openAcc, setOpenAcc] = useState<string | null>("DESCRIPTION");
  const [zoomed, setZoomed] = useState(false);
  const [buyingPartner, setBuyingPartner] = useState(false);
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
  const affiliate = isAffiliateProduct(product);
  const outOfStock = product.stock <= 0 || product.availability === "out_of_stock";
  const recentProducts = recentlyViewed
    .filter((id) => id !== product.id)
    .map((id) => catalog.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p))
    .slice(0, 4);

  async function buyFromPartner() {
    setBuyingPartner(true);
    try {
      const res = await fetch(`/api/affiliate/go/${product.slug}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Partner link unavailable");
      window.location.assign(data.url);
    } catch {
      setBuyingPartner(false);
    }
  }

  const sections = [
    { id: "DESCRIPTION", body: product.description },
    { id: "FABRIC", body: `${product.material} · Colour: ${product.color}` },
    { id: "SIZE & FIT", body: product.dimensions || "True to size. Size up for an oversized fit. Model is 6'1\" and wears M." },
    { id: "CARE", body: product.care || "" },
    { id: "SHIPPING", body: product.shippingInfo || "" },
    { id: "RETURNS", body: product.returnsInfo || "" },
    { id: "WARRANTY", body: product.warranty || "" },
  ];

  return (
    <div className="mx-auto max-w-site px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-line">
            <Image
              src={images[active]?.url || getPrimaryImage(product)}
              alt={product.name}
              fill
              priority
              className={`object-cover transition duration-700 ease-luxe ${zoomed ? "scale-125 cursor-zoom-out" : "cursor-zoom-in"}`}
              sizes="(max-width:1024px) 100vw, 50vw"
              onClick={() => setZoomed((z) => !z)}
            />
            {product.videoUrl && active === 0 ? (
              <span className="absolute bottom-3 left-3 border border-gold bg-ivory/95 px-2 py-1 text-[9px] tracking-[0.16em] uppercase text-gold-deep">
                Film
              </span>
            ) : null}
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActive(i)}
                className={`relative aspect-[3/4] overflow-hidden rounded-lg border-2 ${
                  active === i ? "border-ink" : "border-transparent"
                }`}
              >
                <Image src={img.url} alt="" fill className="object-cover" sizes="120px" />
              </button>
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          {formatProductLabel(product.label || product.badge) ? (
            <p className="text-[11px] tracking-[0.18em] uppercase text-muted">
              {formatProductLabel(product.label || product.badge)}
            </p>
          ) : null}
          <h1 className="mt-2 font-serif text-5xl uppercase leading-[0.9] md:text-6xl">{product.name}</h1>
          <p className="mt-3 text-sm text-muted">
            {product.rating.toFixed(1)} · {product.reviewCount} reviews
          </p>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-semibold">{formatINR(product.price)}</span>
            {product.mrp > product.price ? (
              <>
                <span className="text-muted line-through">{formatINR(product.mrp)}</span>
                <span className="text-sale text-sm">{product.discountPercent}% off</span>
              </>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-muted">
            {outOfStock
              ? "Currently unavailable"
              : product.estimatedDelivery || "In stock — ships in 24–48 hrs"}
          </p>
          {product.material ? (
            <p className="mt-2 text-sm text-muted">{product.material} · {product.color}</p>
          ) : null}

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                Size{size ? `: ${size}` : ""}
              </p>
              <Link href="/policies/size-guide" className="text-xs text-muted underline">Size guide</Link>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSize(s);
                    setSizeError(false);
                  }}
                  aria-pressed={size === s}
                  className={`rounded-lg border py-3 text-sm font-semibold transition ${
                    size === s ? "border-ink bg-ink text-ivory" : "border-line hover:border-ink"
                  } ${product.sizes.length === 1 ? "col-span-5" : ""}`}
                >
                  {s}
                </button>
              ))}
            </div>
            {sizeError ? <p className="mt-2 text-xs font-semibold text-sale">Pick a size first.</p> : null}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {affiliate ? (
              <button
                type="button"
                className="rounded-full bg-ink py-4 text-[11px] font-semibold tracking-[0.18em] uppercase text-ivory hover:bg-ink/85 sm:col-span-2 disabled:opacity-50"
                data-cursor="shop"
                disabled={outOfStock || buyingPartner}
                onClick={() => void buyFromPartner()}
              >
                {buyingPartner ? "Opening partner…" : "Buy from Partner"}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="rounded-full bg-ink py-4 text-[11px] font-semibold tracking-[0.18em] uppercase text-ivory hover:bg-ink/85 disabled:opacity-50"
                  data-cursor="shop"
                  disabled={outOfStock}
                  onClick={() => {
                    if (!size) return setSizeError(true);
                    addToCart(product, 1, size);
                    setCartOpen(true);
                  }}
                >
                  Add to Bag
                </button>
                <Link
                  href="/checkout"
                  onClick={(e) => {
                    if (!size) {
                      e.preventDefault();
                      setSizeError(true);
                      return;
                    }
                    addToCart(product, 1, size);
                  }}
                  className="rounded-full border border-ink py-4 text-center text-[11px] font-semibold tracking-[0.18em] uppercase hover:bg-gold"
                  data-cursor="shop"
                >
                  Buy Now
                </Link>
              </>
            )}
          </div>
          {affiliate ? (
            <p className="mt-3 text-xs leading-relaxed text-muted">
              This item is sold by a partner label. You complete purchase on their site. See our{" "}
              <Link href="/policies/affiliate-disclosure" className="underline">
                affiliate disclosure
              </Link>
              .
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            className="mt-3 text-sm underline"
          >
            {wishlisted ? "Saved to wishlist" : "Add to wishlist"}
          </button>

          <ul className="mt-8 grid grid-cols-3 gap-3 text-center text-[10px] tracking-[0.12em] uppercase text-muted">
            <li className="rounded-lg border border-line px-2 py-3">Secure checkout</li>
            <li className="rounded-lg border border-line px-2 py-3">Easy returns</li>
            <li className="rounded-lg border border-line px-2 py-3">Free size swap</li>
          </ul>

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
          <TrustBadges />
        </div>
      </div>

      <section className="mt-20">
        <h2 className="section-title">Complete the fit</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {pairWith.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-serif text-4xl uppercase md:text-5xl">You may also like</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {alsoLike.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {recentProducts.length ? (
        <section className="mt-16">
          <h2 className="font-serif text-4xl uppercase md:text-5xl">Recently viewed</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {recentProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ivory p-3 lg:hidden">
        {affiliate ? (
          <button
            type="button"
            className="w-full rounded-full bg-ink py-3 text-[11px] font-semibold tracking-[0.18em] uppercase text-ivory"
            onClick={() => void buyFromPartner()}
          >
            {buyingPartner ? "Opening partner…" : `Buy from Partner · ${formatINR(product.price)}`}
          </button>
        ) : (
          <button
            type="button"
            className="w-full rounded-full bg-ink py-3 text-[11px] font-semibold tracking-[0.18em] uppercase text-ivory"
            onClick={() => {
              if (!size) {
                setSizeError(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
                return;
              }
              addToCart(product, 1, size);
              setCartOpen(true);
            }}
          >
            Add to Bag · {formatINR(product.price)}
          </button>
        )}
      </div>
    </div>
  );
}
