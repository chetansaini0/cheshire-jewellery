"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@cheshire/types";
import { FREE_SHIPPING_THRESHOLD, calcShipping } from "@cheshire/utils";
import { isAffiliateProduct, partitionCartItems } from "@cheshire/commerce";

export type LocalCartItem = {
  id: string;
  productId: string;
  variantLabel?: string;
  quantity: number;
  product: Product;
};

type CommerceState = {
  cart: LocalCartItem[];
  wishlistIds: string[];
  recentlyViewed: string[];
  couponCode: string | null;
  couponDiscount: number;
  addToCart: (product: Product, quantity?: number, variantLabel?: string) => void;
  updateQty: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  toggleWishlist: (productId: string) => void;
  trackView: (productId: string) => void;
  applyCoupon: (code: string) => { ok: boolean; message: string };
  clearCoupon: () => void;
  clearCart: () => void;
};

function cartId(productId: string, variantLabel?: string) {
  return `${productId}:${variantLabel ?? "default"}`;
}

export const useCommerceStore = create<CommerceState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlistIds: [],
      recentlyViewed: [],
      couponCode: null,
      couponDiscount: 0,
      addToCart: (product, quantity = 1, variantLabel) => {
        const id = cartId(product.id, variantLabel);
        const existing = get().cart.find((i) => i.id === id);
        if (existing) {
          set({
            cart: get().cart.map((i) =>
              i.id === id ? { ...i, quantity: i.quantity + quantity } : i
            ),
          });
        } else {
          set({
            cart: [
              ...get().cart,
              { id, productId: product.id, variantLabel, quantity, product },
            ],
          });
        }
      },
      updateQty: (id, quantity) => {
        if (quantity <= 0) {
          set({ cart: get().cart.filter((i) => i.id !== id) });
          return;
        }
        set({
          cart: get().cart.map((i) => (i.id === id ? { ...i, quantity } : i)),
        });
      },
      removeFromCart: (id) => set({ cart: get().cart.filter((i) => i.id !== id) }),
      toggleWishlist: (productId) => {
        const has = get().wishlistIds.includes(productId);
        set({
          wishlistIds: has
            ? get().wishlistIds.filter((id) => id !== productId)
            : [...get().wishlistIds, productId],
        });
      },
      trackView: (productId) => {
        const next = [productId, ...get().recentlyViewed.filter((id) => id !== productId)].slice(
          0,
          12
        );
        set({ recentlyViewed: next });
      },
      applyCoupon: (code) => {
        const normalized = code.trim().toUpperCase();
        const coupons: Record<string, number> = {
          CHESHIRE10: 0.1,
          WELCOME199: 199,
          FIRSTORDER: 0.15,
        };
        if (normalized === "FREESHIP") {
          set({ couponCode: normalized, couponDiscount: 0 });
          return { ok: true, message: "Free shipping applied" };
        }
        const value = coupons[normalized];
        if (!value) return { ok: false, message: "Invalid coupon" };
        const subtotal = get().cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
        const discount =
          value < 1 ? Math.round(subtotal * value) : Math.min(value, subtotal);
        set({ couponCode: normalized, couponDiscount: discount });
        return { ok: true, message: "Coupon applied" };
      },
      clearCoupon: () => set({ couponCode: null, couponDiscount: 0 }),
      clearCart: () => set({ cart: [], couponCode: null, couponDiscount: 0 }),
    }),
    { name: "cheshire-commerce" }
  )
);

export function useCartTotals() {
  const cart = useCommerceStore((s) => s.cart);
  const couponCode = useCommerceStore((s) => s.couponCode);
  const couponDiscount = useCommerceStore((s) => s.couponDiscount);
  const partition = partitionCartItems(cart);
  const fulfillable = cart.filter((i) => !isAffiliateProduct(i.product));
  const subtotal = fulfillable.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shipping =
    couponCode === "FREESHIP" ? 0 : calcShipping(subtotal, FREE_SHIPPING_THRESHOLD);
  const discount = couponDiscount;
  const total = Math.max(0, subtotal - discount + shipping);
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const count = cart.reduce((s, i) => s + i.quantity, 0);
  return { subtotal, shipping, discount, total, amountToFreeShipping, count, partition };
}
