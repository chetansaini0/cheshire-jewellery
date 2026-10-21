import Image from "next/image";
import Link from "next/link";
import { productImage } from "@cheshire/database/catalog";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-ivory">
      <div className="absolute inset-0 -z-10 grid grid-cols-1 md:grid-cols-2">
        <div className="relative">
          <Image
            src={productImage("photo-1520975954732-35dd22299614", 1400)}
            alt="CHESHIRE model in black leather"
            fill
            priority
            sizes="(max-width:768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="relative hidden md:block">
          <Image
            src={productImage("photo-1529139574466-a303027c1d8b", 1400)}
            alt="CHESHIRE model in red"
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/10" />
      </div>

      <div className="mx-auto flex min-h-[86svh] max-w-site flex-col justify-end px-4 pb-10 pt-32 sm:px-6 lg:px-10 lg:pb-14">
        <p className="inline-flex w-fit items-center gap-2 bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-ink">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink" /> Drop 07 — Live now
        </p>
        <h1 className="mt-5 font-serif text-[18vw] uppercase leading-[0.82] tracking-tight md:text-[11vw] xl:text-[10rem]">
          Wear the
          <br />
          <span className="text-stroke">moment.</span>
        </h1>
        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <p className="max-w-md text-sm leading-relaxed text-ivory/80 md:text-base">
            Heavyweight essentials, loud graphics and sharp outerwear. Designed in India, built to be lived in.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/shop?sort=newest" className="btn-primary">Shop the drop</Link>
            <Link href="/inspiration" className="btn-outline-gold">View lookbook</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
