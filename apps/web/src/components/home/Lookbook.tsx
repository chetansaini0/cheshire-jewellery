import Image from "next/image";
import Link from "next/link";
import { productImage } from "@cheshire/database/catalog";
import { SectionHeading } from "@cheshire/ui";

const frames = [
  { id: "px:13222257", title: "The Nehru, reworked", href: "/men" },
  { id: "px:19556879", title: "Print in blue", href: "/shop/kurtas" },
  { id: "photo-1578587018452-892bacefd3f2", title: "Soft layers", href: "/shop/sweatshirts" },
  { id: "px:27329528", title: "Festive, quietly", href: "/collections/festive-edit" },
];

export function Lookbook() {
  return (
    <section className="mx-auto max-w-site px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
      <div className="flex items-end justify-between gap-4">
        <SectionHeading eyebrow="Lookbook" title="Styled for now" />
        <Link href="/inspiration" className="link-arrow">
          Full lookbook
        </Link>
      </div>
      <div className="no-scrollbar -mx-4 mt-10 flex snap-x gap-4 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0">
        {frames.map((f) => (
          <Link key={f.id} href={f.href} className="group block w-[68vw] shrink-0 snap-start md:w-auto">
            <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-card">
              <Image src={productImage(f.id, 900)} alt={f.title} fill sizes="(max-width:768px) 68vw, 25vw" className="object-cover transition duration-[1200ms] ease-luxe group-hover:scale-[1.03]" />
            </div>
            <p className="mt-3 font-serif text-xl font-medium transition group-hover:text-gold">{f.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
