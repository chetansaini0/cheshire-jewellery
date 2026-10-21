import Image from "next/image";
import Link from "next/link";
import { productImage } from "@cheshire/database/catalog";

export function Campaign() {
  return (
    <section className="mx-auto max-w-site px-4 sm:px-6 lg:px-10">
      <div className="relative overflow-hidden rounded-3xl bg-gold text-ink">
        <div className="grid items-center md:grid-cols-2">
          <div className="p-8 md:p-14">
            <p className="eyebrow">Denim Lab</p>
            <h2 className="mt-3 font-serif text-6xl uppercase leading-[0.85] md:text-8xl">Baggy is back.</h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink/75">14oz rigid denim, cut wide and low. Built to fade into your story.</p>
            <Link href="/shop/denim" className="mt-8 inline-block rounded-full bg-ink px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory transition hover:bg-ink/80">Shop denim</Link>
          </div>
          <div className="relative aspect-[4/5] md:aspect-auto md:h-full md:min-h-[520px]">
            <Image src={productImage("photo-1541099649105-f69ad21f3246", 1200)} alt="Baggy denim" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
