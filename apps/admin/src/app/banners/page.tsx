import { readAllHeroBanners, bannerFilePath } from "@cheshire/config/banner-store";
import { PageHeader } from "@/components/ui";
import { BannerManager } from "./BannerManager";

export const metadata = { title: "Banners" };

export default function BannersPage() {
  const { banners, source } = readAllHeroBanners();
  return (
    <div>
      <PageHeader
        eyebrow="Storefront content"
        title="Hero banners"
        subtitle="Add, edit, reorder and toggle the homepage carousel (up to 8 active). Changes go live on the local storefront at localhost:3000 the next time the page loads."
      />
      <BannerManager initial={banners} source={source} filePath={bannerFilePath()} storefrontUrl={process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"} />
    </div>
  );
}
