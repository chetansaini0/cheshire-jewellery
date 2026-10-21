import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopClient } from "./ShopClient";

export const metadata: Metadata = {
  title: "Shop streetwear & clothing online",
  description:
    "Browse CHESHIRE tees, hoodies, outerwear, denim, dresses, co-ords and accessories. New drops every Friday.",
};

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-muted">Loading catalogue…</div>}>
      <ShopClient initialCategory="all" />
    </Suspense>
  );
}
