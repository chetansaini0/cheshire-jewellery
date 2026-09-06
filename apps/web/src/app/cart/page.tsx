"use client";

import Link from "next/link";
import Image from "next/image";
import { formatINR, getPrimaryImage } from "@cheshire/utils";
import { useCartTotals, useCommerceStore } from "@/store/commerce";

export default function CartPage() {
  const cart = useCommerceStore((s) => s.cart);
  const updateQty = useCommerceStore((s) => s.updateQty);
  const removeFromCart = useCommerceStore((s) => s.removeFromCart);
  const applyCoupon = useCommerceStore((s) => s.applyCoupon);
  const couponCode = useCommerceStore((s) => s.couponCode);
  const { subtotal, shipping, discount, total, amountToFreeShipping } = useCartTotals();

  return (
    <div className="mx-auto max-w-site px-4 py-12 sm:px-6 lg:px-10">
      <h1 className="font-serif text-4xl md:text-5xl">Cart</h1>
      {cart.length === 0 ? (
        <div className="mt-10">
          <p className="text-muted">Your cart is empty.</p>
          <Link href="/shop" className="mt-4 inline-block underline">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[1.4fr_0.8fr]">
          <ul className="space-y-6">
            {cart.map((item) => (
              <li key={item.id} className="flex gap-4 border-b border-line pb-6">
                <div className="relative h-28 w-24 overflow-hidden bg-[#ebe7df]">
                  <Image src={getPrimaryImage(item.product)} alt="" fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <Link href={`/products/${item.product.slug}`}>{item.product.name}</Link>
                  <p className="text-sm text-muted">{item.variantLabel}</p>
                  <p className="mt-1">{formatINR(item.product.price)}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <button type="button" onClick={() => updateQty(item.id, item.quantity - 1)}>
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateQty(item.id, item.quantity + 1)}>
                      +
                    </button>
                    <button
                      type="button"
                      className="ml-4 text-xs underline"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <aside className="h-fit border border-line p-6">
            <p className="text-sm text-muted">
              {amountToFreeShipping > 0
                ? `₹${amountToFreeShipping} away from free shipping`
                : "Free shipping unlocked"}
            </p>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                applyCoupon(String(fd.get("coupon") || ""));
              }}
            >
              <input
                name="coupon"
                placeholder="Coupon code"
                defaultValue={couponCode || ""}
                className="flex-1 border border-line bg-transparent px-3 py-2 text-sm"
              />
              <button type="submit" className="border border-ink px-3 text-xs uppercase">
                Apply
              </button>
            </form>
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>-{formatINR(discount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping ? formatINR(shipping) : "FREE"}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="mt-6 block bg-ink py-3 text-center text-[11px] tracking-[0.16em] uppercase text-ivory"
            >
              Checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
