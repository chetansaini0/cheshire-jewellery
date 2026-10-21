"use client";

import Image from "next/image";
import Link from "next/link";
import { productImage } from "@cheshire/database/catalog";

export function CheshireEdit() {
  return (
    <section className="mx-auto grid max-w-site items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-10 lg:py-24">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-line lg:col-span-7">
        <Image
          src={productImage("photo-1483985988355-763728e1935b", 1400)}
          alt="The Core Edit"
          fill
          className="object-cover"
          sizes="(max-width:1024px) 100vw, 58vw"
        />
      </div>
      <div className="lg:col-span-5 lg:pl-6">
        <p className="text-[11px] tracking-[0.22em] uppercase text-muted">Campaign</p>
        <h2 className="mt-3 font-serif text-5xl leading-none md:text-6xl">THE CORE EDIT</h2>
        <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
          Heavyweight essentials you’ll wear on repeat.
        </p>
        <Link
          href="/collections/core"
          className="mt-8 inline-flex border border-ink px-6 py-3 text-[11px] tracking-[0.18em] uppercase"
          data-cursor="view"
        >
          Explore the Edit
        </Link>
      </div>
    </section>
  );
}
