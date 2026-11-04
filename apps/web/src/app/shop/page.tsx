import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopClient } from "./ShopClient";

export const metadata: Metadata = {
  title: "Shop all",
  description:
    "Shop CHESHIRE: sarees, lehengas, suits and kurtas alongside hoodies, tees, sweatshirts and accessories. Roots. Remixed.",
};

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-muted">Loading catalogue…</div>}>
      <ShopClient initialCategory="all" />
    </Suspense>
  );
}
