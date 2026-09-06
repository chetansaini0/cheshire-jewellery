"use client";

import Image from "next/image";
import { productImage } from "@cheshire/database/catalog";

const shots = [
  "photo-1515562141207-7a88fb7ce338",
  "photo-1611652022419-a9419f74343d",
  "photo-1535632066927-ab7c9ab60908",
  "photo-1605100804763-247f67b3557e",
  "photo-1599643478518-a784e5dc4c8f",
  "photo-1611591437281-460bfbe1220a",
];

export function WornByYou() {
  return (
    <section className="mx-auto max-w-site px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
      <h2 className="font-serif text-4xl md:text-5xl">WORN BY THE CHESHIRE COMMUNITY.</h2>
      <div className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
        {shots.map((id, i) => (
          <div key={id} className={`relative aspect-square overflow-hidden bg-[#ebe7df] ${i === 0 ? "md:row-span-1" : ""}`}>
            <Image
              src={productImage(id, 800)}
              alt="CHESHIRE community"
              fill
              className="object-cover"
              sizes="(max-width:768px) 50vw, 33vw"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
