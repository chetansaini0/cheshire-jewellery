import type { Metadata } from "next";
import { ProductListing } from "@/components/product/ProductListing";
import { getByAudience } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Women",
  description: "Sarees, lehengas, suits and kurtas with hoodies, tees, dresses and accessories. Fusion wear for women at CHESHIRE.",
  alternates: { canonical: "/women" },
};

export default function WomenPage() {
  return (
    <ProductListing
      eyebrow="Women"
      title={
        <>
          For <span className="italic text-gold">her</span> world
        </>
      }
      intro="Sarees and lehengas next to soft hoodies and denim. Wear the drape with sneakers, or the tee with jhumkas."
      products={getByAudience("women")}
      related={[
        { label: "Sarees", href: "/shop/sarees" },
        { label: "Lehengas", href: "/shop/lehengas" },
        { label: "Suits", href: "/shop/suits" },
        { label: "Kurtas", href: "/shop/kurtas" },
        { label: "Dresses", href: "/shop/dresses" },
      ]}
    />
  );
}
