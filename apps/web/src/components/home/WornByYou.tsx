"use client";

import Image from "next/image";
import Link from "next/link";
import { lifestyleShots, pinSrc } from "@/data/inspiration";

export function WornByYou() {
  return (
    <section className="mx-auto max-w-site px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-serif text-4xl md:text-5xl">WORN BY THE CHESHIRE COMMUNITY.</h2>
        <Link href="/inspiration" className="hidden text-[11px] tracking-[0.16em] uppercase underline sm:inline">
          Inspiration
        </Link>
      </div>
      <div className="mt-10 columns-2 gap-2 md:columns-3 md:gap-3 lg:columns-4">
        {lifestyleShots.map((shot, i) => (
          <div
            key={`${shot.id}-${i}`}
            className={`relative mb-2 break-inside-avoid overflow-hidden bg-[#ebe7df] md:mb-3 ${
              i % 5 === 0 ? "aspect-[3/4]" : i % 3 === 0 ? "aspect-[4/3]" : "aspect-square"
            }`}
          >
            <Image
              src={pinSrc(shot.id, 800)}
              alt={shot.label}
              fill
              className="object-cover"
              sizes="(max-width:768px) 50vw, 25vw"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
