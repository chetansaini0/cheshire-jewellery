"use client";

import { useRef } from "react";
import type { Product } from "@cheshire/types";
import { ProductCard } from "@/components/product/ProductCard";

export function Bestsellers({ products }: { products: Product[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: number) => {
    ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto flex max-w-site items-end justify-between px-4 sm:px-6 lg:px-10">
        <h2 className="max-w-xl font-serif text-4xl md:text-5xl lg:text-6xl">
          THE ONES EVERYONE WANTS.
        </h2>
        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scrollBy(-1)}
            className="h-10 w-10 border border-line"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => scrollBy(1)}
            className="h-10 w-10 border border-line"
          >
            →
          </button>
        </div>
      </div>
      <div
        ref={ref}
        className="mt-10 flex gap-4 overflow-x-auto px-4 pb-4 no-scrollbar sm:px-6 lg:px-10"
        data-cursor="drag"
      >
        {products.map((p) => (
          <div key={p.id} className="min-w-[70%] sm:min-w-[280px] md:min-w-[300px]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
