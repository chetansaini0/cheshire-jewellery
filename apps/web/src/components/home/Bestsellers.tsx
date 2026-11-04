import type { Product } from "@cheshire/types";
import { NewDrops } from "./NewDrops";

export function Bestsellers({ products }: { products: Product[] }) {
  return (
    <div className="bg-card">
      <NewDrops products={products} eyebrow="Most loved" title="Worn on repeat" href="/shop?sort=bestselling" linkLabel="See all" />
    </div>
  );
}
