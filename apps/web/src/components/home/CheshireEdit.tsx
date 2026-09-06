"use client";

import Image from "next/image";
import Link from "next/link";
import { productImage } from "@cheshire/database/catalog";

export function CheshireEdit() {
  return (
    <section className="mx-auto grid max-w-site items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-10 lg:py-24">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#ebe7df] lg:col-span-7">
        <Image
          src={productImage("photo-1617038260897-41a1f14a8ca0", 1400)}
          alt="The Cheshire Edit"
          fill
          className="object-cover"
          sizes="(max-width:1024px) 100vw, 58vw"
        />
      </div>
      <div className="lg:col-span-5 lg:pl-6">
        <p className="text-[11px] tracking-[0.22em] uppercase text-muted">Campaign</p>
        <h2 className="mt-3 font-serif text-5xl leading-none md:text-6xl">THE CHESHIRE EDIT</h2>
        <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
          Pieces designed to become part of your signature.
        </p>
        <Link
          href="/collections/the-cheshire-edit"
          className="mt-8 inline-flex border border-ink px-6 py-3 text-[11px] tracking-[0.18em] uppercase"
          data-cursor="view"
        >
          Explore the Edit
        </Link>
      </div>
    </section>
  );
}
