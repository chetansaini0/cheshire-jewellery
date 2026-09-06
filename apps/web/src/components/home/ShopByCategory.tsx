"use client";

import Image from "next/image";
import Link from "next/link";
import { categories } from "@cheshire/config";
import { categoryMeta } from "@/lib/catalog";
import { motion } from "framer-motion";

export function ShopByCategory() {
  return (
    <section className="mx-auto max-w-site px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
      <div className="flex items-end justify-between gap-6">
        <h2 className="font-serif text-4xl md:text-5xl">Shop by category</h2>
        <Link href="/shop" className="hidden text-[11px] tracking-[0.18em] uppercase underline sm:inline">
          View all
        </Link>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
        {categories.map((cat, i) => {
          const meta = categoryMeta.find((c) => c.slug === cat.slug);
          return (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: i * 0.05, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className={i % 5 === 0 ? "md:row-span-1 md:translate-y-6" : ""}
            >
              <Link href={cat.href} className="group block" data-cursor="view">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#ebe7df]">
                  {meta?.imageUrl ? (
                    <Image
                      src={meta.imageUrl}
                      alt={cat.name}
                      fill
                      className="object-cover transition duration-700 ease-luxe group-hover:scale-105"
                      sizes="(max-width:768px) 50vw, 33vw"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
                  <p className="absolute bottom-4 left-4 font-serif text-2xl tracking-wide text-ivory md:text-3xl">
                    {cat.name}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
