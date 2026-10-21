import Image from "next/image";
import Link from "next/link";
import { productImage } from "@cheshire/database/catalog";

const frames = [
  { id: "photo-1539533018447-63fcce2678e3", title: "Trench season", href: "/shop/outerwear", cls: "md:col-span-2 md:row-span-2" },
  { id: "photo-1503342217505-b0a15ec3261c", title: "Graphic tees", href: "/shop/tees", cls: "" },
  { id: "photo-1509631179647-0177331693ae", title: "Track sets", href: "/shop/co-ords", cls: "" },
  { id: "photo-1488161628813-04466f872be2", title: "Off duty", href: "/shop?mood=everyday", cls: "md:col-span-2" },
];

export function Lookbook() {
  return (
    <section className="mx-auto max-w-site px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Lookbook — FW26</p>
          <h2 className="section-title mt-2">Styled by the street</h2>
        </div>
        <Link href="/inspiration" className="link-arrow">Full lookbook</Link>
      </div>
      <div className="mt-8 grid auto-rows-[46vw] grid-cols-2 gap-3 md:auto-rows-[22vw] md:grid-cols-4 md:gap-4 xl:auto-rows-[300px]">
        {frames.map((f, i) => (
          <Link key={f.id} href={f.href} className={`group relative overflow-hidden rounded-2xl bg-line ${i === 0 ? "col-span-2 row-span-2" : ""} ${f.cls}`}>
            <Image src={productImage(f.id, 1200)} alt={f.title} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover transition duration-700 ease-luxe group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
            <p className="absolute bottom-4 left-4 font-serif text-2xl uppercase text-ivory md:text-3xl">{f.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
