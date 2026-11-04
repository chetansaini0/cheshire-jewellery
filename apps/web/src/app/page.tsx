import { Hero } from "@/components/home/Hero";
import { ShopByCategory } from "@/components/home/ShopByCategory";
import { NewDrops } from "@/components/home/NewDrops";
import { Bestsellers } from "@/components/home/Bestsellers";
import { Lookbook } from "@/components/home/Lookbook";
import { Campaign } from "@/components/home/Campaign";
import { ClubSignup } from "@/components/home/ClubSignup";
import { getBestsellers, getNewIn, mixGroups } from "@/lib/catalog";
import { readHeroBanners } from "@cheshire/config/banner-store";
import { brand, seoDefaults } from "@cheshire/config";

export default function HomePage() {
  const newIn = getNewIn(8);
  const bestsellers = mixGroups(getBestsellers(12)).slice(0, 8);
  // Admin → Banners writes .data/hero-banners.json locally; Vercel builds use the committed defaults.
  const banners = readHeroBanners();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CHESHIRE",
    url: seoDefaults.siteUrl,
    slogan: brand.tagline,
    description: seoDefaults.description,
    brand: "CHESHIRE Clothing",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero banners={banners} />
      <section className="mx-auto max-w-3xl px-6 py-16 text-center lg:py-24">
        <p className="eyebrow">{brand.secondaryTagline}</p>
        <p className="mt-5 font-serif text-3xl font-medium leading-snug md:text-[2.6rem]">
          Luxury without trying too hard. <span className="italic text-gold">Rooted in tradition, styled for now.</span>
        </p>
      </section>
      <NewDrops products={newIn} />
      <ShopByCategory />
      <Campaign />
      <Bestsellers products={bestsellers} />
      <Lookbook />
      <ClubSignup />
    </>
  );
}
