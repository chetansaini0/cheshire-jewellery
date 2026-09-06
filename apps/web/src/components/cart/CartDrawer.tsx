"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { formatINR, getPrimaryImage } from "@cheshire/utils";
import { useUI } from "@/components/providers/UIProvider";
import { useCartTotals, useCommerceStore } from "@/store/commerce";
import { catalog } from "@/lib/catalog";

export function CartDrawer() {
  const { cartOpen, setCartOpen } = useUI();
  const cart = useCommerceStore((s) => s.cart);
  const updateQty = useCommerceStore((s) => s.updateQty);
  const removeFromCart = useCommerceStore((s) => s.removeFromCart);
  const toggleWishlist = useCommerceStore((s) => s.toggleWishlist);
  const { subtotal, amountToFreeShipping, shipping, discount, total } = useCartTotals();
  const crossSell = catalog.filter((p) => !cart.some((c) => c.productId === p.id)).slice(0, 3);

  return (
    <AnimatePresence>
      {cartOpen ? (
        <>
          <motion.button
            type="button"
            aria-label="Close cart"
            className="fixed inset-0 z-50 bg-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-ivory shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-sm tracking-[0.18em] uppercase">Cart</h2>
              <button type="button" onClick={() => setCartOpen(false)} className="text-sm">
                Close
              </button>
            </div>

            <div className="border-b border-line px-5 py-3 text-xs text-muted">
              {amountToFreeShipping > 0
                ? `₹${amountToFreeShipping} away from FREE SHIPPING`
                : "You’ve unlocked FREE SHIPPING"}
              <div className="mt-2 h-1 bg-line">
                <div
                  className="h-full bg-ink transition-all"
                  style={{
                    width: `${Math.min(100, ((999 - amountToFreeShipping) / 999) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {cart.length === 0 ? (
                <p className="text-sm text-muted">Your cart is empty. Discover something you’ll keep.</p>
              ) : (
                <ul className="space-y-5">
                  {cart.map((item) => (
                    <li key={item.id} className="flex gap-4">
                      <div className="relative h-24 w-20 overflow-hidden bg-[#ebe7df]">
                        <Image
                          src={getPrimaryImage(item.product)}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{item.product.name}</p>
                        {item.variantLabel ? (
                          <p className="text-xs text-muted">{item.variantLabel}</p>
                        ) : null}
                        <p className="mt-1 text-sm">{formatINR(item.product.price)}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <button
                            type="button"
                            className="h-7 w-7 border border-line"
                            onClick={() => updateQty(item.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="text-sm">{item.quantity}</span>
                          <button
                            type="button"
                            className="h-7 w-7 border border-line"
                            onClick={() => updateQty(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <div className="mt-2 flex gap-3 text-xs text-muted">
                          <button type="button" onClick={() => toggleWishlist(item.productId)}>
                            Wishlist
                          </button>
                          <button type="button" onClick={() => removeFromCart(item.id)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {crossSell.length ? (
                <div className="mt-8 border-t border-line pt-6">
                  <p className="text-[11px] tracking-[0.18em] uppercase">Complete the look</p>
                  <div className="mt-4 space-y-3">
                    {crossSell.map((p) => (
                      <div key={p.id} className="flex items-center justify-between gap-3">
                        <Link href={`/products/${p.slug}`} className="text-sm">
                          {p.name}
                        </Link>
                        <span className="text-xs text-muted">{formatINR(p.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="border-t border-line px-5 py-4">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                {discount ? (
                  <div className="flex justify-between text-muted">
                    <span>Discount</span>
                    <span>-{formatINR(discount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-muted">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "FREE" : formatINR(shipping)}</span>
                </div>
                <div className="flex justify-between pt-2 text-base">
                  <span>Total</span>
                  <span>{formatINR(total)}</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link
                  href="/cart"
                  onClick={() => setCartOpen(false)}
                  className="border border-ink py-3 text-center text-[11px] tracking-[0.16em] uppercase"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="bg-ink py-3 text-center text-[11px] tracking-[0.16em] uppercase text-ivory"
                  data-cursor="shop"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
