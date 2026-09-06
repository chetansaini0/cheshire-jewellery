"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { inspirationPins, pinSrc } from "@/data/inspiration";

const aspectClass = {
  tall: "aspect-[3/4]",
  square: "aspect-square",
  wide: "aspect-[4/3]",
} as const;

export function PinterestBoard({
  limit,
  title = "LOOKBOOK INSPIRATION",
  subtitle = "Pinterest-style references for how CHESHIRE is meant to be worn — editorial, layered, and a little rebellious.",
}: {
  limit?: number;
  title?: string;
  subtitle?: string;
}) {
  const pins = limit ? inspirationPins.slice(0, limit) : inspirationPins;

  return (
    <section className="mx-auto max-w-site px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-muted">Moodboard</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl lg:text-6xl">{title}</h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">{subtitle}</p>
        </div>
        <Link
          href="/inspiration"
          className="text-[11px] tracking-[0.18em] uppercase underline"
          data-cursor="view"
        >
          Open full board
        </Link>
      </div>

      {/* Pinterest-like masonry */}
      <div className="mt-10 columns-2 gap-3 md:columns-3 md:gap-4 lg:columns-4">
        {pins.map((pin, i) => (
          <motion.article
            key={pin.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ delay: (i % 6) * 0.04, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mb-3 break-inside-avoid md:mb-4"
          >
            <Link href={pin.href} className="group block" data-cursor="view">
              <div className={`relative overflow-hidden bg-[#ebe7df] ${aspectClass[pin.aspect]}`}>
                <Image
                  src={pinSrc(pin.imageId, 900)}
                  alt={pin.title}
                  fill
                  className="object-cover transition duration-700 ease-luxe group-hover:scale-[1.04]"
                  sizes="(max-width:768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent opacity-80 transition group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 p-3 text-ivory">
                  <p className="text-[10px] tracking-[0.18em] uppercase text-ivory/70">{pin.mood}</p>
                  <p className="mt-1 font-serif text-lg leading-tight md:text-xl">{pin.title}</p>
                </div>
              </div>
            </Link>
          </motion.article>
        ))}
      </div>

      <p className="mt-6 text-[11px] tracking-[0.12em] uppercase text-metal">
        Visual references · Unsplash editorial photography · replace with CHESHIRE studio shoots anytime
      </p>
    </section>
  );
}
