import Image from "next/image";
import Link from "next/link";
import { productImage } from "@cheshire/database/catalog";

/** Editorial story block: fusion styling, two frames. */
export function Campaign() {
  return (
    <section className="mx-auto max-w-site px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
      <div className="grid items-center gap-10 md:grid-cols-12">
        <div className="relative md:col-span-7">
          <div className="grid grid-cols-5 gap-4">
            <div className="relative col-span-3 aspect-[3/4] overflow-hidden rounded-md">
              <Image src={productImage("px:38701448", 1100)} alt="Black saree styled on a city street" fill sizes="(max-width:768px) 60vw, 35vw" className="object-cover" />
            </div>
            <div className="relative col-span-2 mt-16 aspect-[3/4] overflow-hidden rounded-md">
              <Image src={productImage("px:9474564", 800)} alt="Charcoal kurta with sunglasses" fill sizes="(max-width:768px) 40vw, 24vw" className="object-cover" />
            </div>
          </div>
        </div>
        <div className="md:col-span-5 md:pl-6">
          <p className="eyebrow">Wear your world</p>
          <h2 className="mt-4 font-serif text-5xl font-medium leading-[1] md:text-6xl">
            Tradition, <span className="italic text-gold">worn your way.</span>
          </h2>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted">
            A georgette saree with sneakers. A chikankari kurta under a bomber. We design pieces that sit easily between your wardrobe&apos;s two
            worlds, cut with care and finished by hand where it matters.
          </p>
          <div className="mt-8 flex flex-wrap gap-6">
            <Link href="/collections/roots-remixed" className="btn-primary">
              Shop Roots Remixed
            </Link>
            <Link href="/about" className="link-arrow self-center">
              Our story
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
