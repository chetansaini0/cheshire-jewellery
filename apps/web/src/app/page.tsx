import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { ShopByCategory } from "@/components/home/ShopByCategory";
import { NewDrops } from "@/components/home/NewDrops";
import { Bestsellers } from "@/components/home/Bestsellers";
import { Lookbook } from "@/components/home/Lookbook";
import { Campaign } from "@/components/home/Campaign";
import { ClubSignup } from "@/components/home/ClubSignup";
import { WhyCheshire } from "@/components/home/WhyCheshire";
import { getBestsellers, getNewDrops } from "@/lib/catalog";

export default function HomePage() {
  const newDrops = getNewDrops(8);
  const bestsellers = getBestsellers(10);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CHESHIRE",
    url: "https://www.cheshire.com",
    description: "CHESHIRE is a streetwear and clothing label: heavyweight tees, hoodies, outerwear, denim, dresses and co-ords.",
    brand: "CHESHIRE Clothing",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero />
      <div className="border-y border-ink bg-gold py-4 text-ink">
        <Marquee
          items={["Heavyweight tees", "Baggy denim", "Track sets", "Outerwear", "New drop Fridays", "Made in India"]}
          className="font-serif text-3xl uppercase md:text-5xl"
          separator="✺"
        />
      </div>
      <ShopByCategory />
      <NewDrops products={newDrops} />
      <Bestsellers products={bestsellers} />
      <Lookbook />
      <Campaign />
      <WhyCheshire />
      <ClubSignup />
    </>
  );
}
