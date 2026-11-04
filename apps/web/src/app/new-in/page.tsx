import type { Metadata } from "next";
import { ProductListing } from "@/components/product/ProductListing";
import { getNewIn } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "New in",
  description: "New arrivals at CHESHIRE: kurtas, sarees and suits alongside hoodies, tees and sweatshirts. Roots. Remixed.",
  alternates: { canonical: "/new-in" },
};

export default function NewInPage() {
  return (
    <ProductListing
      eyebrow="Just landed"
      title={
        <>
          New <span className="italic text-gold">in</span>
        </>
      }
      intro="The latest pieces, ethnic and everyday side by side. Mix them however you like."
      products={getNewIn()}
      related={[
        { label: "Women", href: "/women" },
        { label: "Men", href: "/men" },
        { label: "Collections", href: "/collections" },
      ]}
    />
  );
}
