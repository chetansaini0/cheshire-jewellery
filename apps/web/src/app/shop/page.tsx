import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopClient } from "./ShopClient";

export const metadata: Metadata = {
  title: "Shop aesthetic jewellery online",
  description:
    "Browse CHESHIRE rings, necklaces, earrings, bracelets, anklets and sets. Minimal, bold, romantic and statement jewellery.",
};

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-muted">Loading catalogue…</div>}>
      <ShopClient initialCategory="all" />
    </Suspense>
  );
}
