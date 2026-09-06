import { Hero } from "@/components/home/Hero";
import { ShopByCategory } from "@/components/home/ShopByCategory";
import { NewDrops } from "@/components/home/NewDrops";
import { CheshireEdit } from "@/components/home/CheshireEdit";
import { Bestsellers } from "@/components/home/Bestsellers";
import { ShopByMood } from "@/components/home/ShopByMood";
import { Gifting } from "@/components/home/Gifting";
import { Campaign } from "@/components/home/Campaign";
import { WhyCheshire } from "@/components/home/WhyCheshire";
import { WornByYou } from "@/components/home/WornByYou";
import { PinterestBoard } from "@/components/home/PinterestBoard";
import { StylistTeaser } from "@/components/home/StylistTeaser";
import { getBestsellers, getNewDrops } from "@/lib/catalog";

export default function HomePage() {
  const newDrops = getNewDrops(8);
  const bestsellers = getBestsellers(10);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CHESHIRE",
    url: "https://www.cheshire.com",
    description: "Contemporary aesthetic jewellery for people who treat jewellery as part of their identity.",
    brand: "CHESHIRE Jewellery",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <ShopByCategory />
      <NewDrops products={newDrops} />
      <CheshireEdit />
      <Bestsellers products={bestsellers} />
      <ShopByMood />
      <PinterestBoard limit={8} />
      <Gifting />
      <Campaign />
      <WhyCheshire />
      <WornByYou />
      <StylistTeaser />
    </>
  );
}
