import type { Metadata } from "next";
import { ProductListing } from "@/components/product/ProductListing";
import { getByAudience } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Men",
  description: "Kurtas and Nehru jackets alongside hoodies, tees, sweatshirts, denim and accessories. Fusion wear for men at CHESHIRE.",
  alternates: { canonical: "/men" },
};

export default function MenPage() {
  return (
    <ProductListing
      eyebrow="Men"
      title={
        <>
          For <span className="italic text-gold">his</span> world
        </>
      }
      intro="Kurtas and Nehru layers worn with hoodies, denim and sneakers. Easy pieces with a little ceremony."
      products={getByAudience("men")}
      related={[
        { label: "Kurtas", href: "/shop/kurtas" },
        { label: "Hoodies", href: "/shop/hoodies" },
        { label: "Sweatshirts", href: "/shop/sweatshirts" },
        { label: "T-shirts", href: "/shop/tees" },
        { label: "Accessories", href: "/shop/accessories" },
      ]}
    />
  );
}
