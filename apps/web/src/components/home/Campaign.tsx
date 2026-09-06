"use client";

import Image from "next/image";
import Link from "next/link";
import { productImage } from "@cheshire/database/catalog";

export function Campaign() {
  return (
    <section className="relative min-h-[70vh] overflow-hidden">
      <Image
        src={productImage("photo-1599643478518-a784e5dc4c8f", 1800)}
        alt="Don't follow the look"
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-ink/45" />
      <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-site flex-col justify-center px-4 text-ivory sm:px-6 lg:px-10">
        <h2 className="font-serif text-5xl leading-none md:text-7xl">DON&apos;T FOLLOW THE LOOK.</h2>
        <p className="mt-4 text-lg text-ivory/80">Create your own.</p>
        <Link
          href="/shop"
          className="mt-8 inline-flex w-fit bg-ivory px-7 py-3 text-[11px] tracking-[0.18em] uppercase text-ink"
          data-cursor="shop"
        >
          Shop Now
        </Link>
      </div>
    </section>
  );
}
