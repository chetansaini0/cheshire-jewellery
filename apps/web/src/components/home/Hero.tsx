"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { productImage } from "@cheshire/database/catalog";

export function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-ink text-ivory">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src={productImage("photo-1515562141207-7a88fb7ce338", 1800)}
          alt="CHESHIRE campaign jewellery"
          fill
          priority
          className="object-cover opacity-70"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/25 to-ink/70" />
      </motion.div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-site flex-col justify-end px-4 pb-16 pt-28 sm:px-6 lg:px-10 lg:pb-20">
        <motion.p
          className="text-[11px] tracking-[0.28em] uppercase text-ivory/70"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Luxury without trying too hard
        </motion.p>
        <motion.h1
          className="mt-4 max-w-4xl font-serif text-5xl leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.9 }}
        >
          WEAR YOUR STORY.
        </motion.h1>
        <motion.p
          className="mt-5 max-w-md text-sm leading-relaxed text-ivory/80 sm:text-base"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.8 }}
        >
          Jewellery designed for the moments that become memories.
        </motion.p>
        <motion.div
          className="mt-8 flex flex-wrap gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <Link
            href="/shop?sort=newest"
            className="bg-ivory px-7 py-3 text-[11px] tracking-[0.18em] uppercase text-ink"
            data-cursor="shop"
          >
            Shop New
          </Link>
          <Link
            href="/about"
            className="border border-ivory/70 px-7 py-3 text-[11px] tracking-[0.18em] uppercase text-ivory"
            data-cursor="view"
          >
            Explore CHESHIRE
          </Link>
        </motion.div>
        <motion.div
          className="mt-14 flex items-center gap-3 text-[10px] tracking-[0.22em] uppercase text-ivory/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <span className="block h-10 w-px bg-ivory/40" />
          Scroll
        </motion.div>
      </div>
    </section>
  );
}
