import Image from "next/image";
import Link from "next/link";
import { heroBanners } from "@cheshire/config";
import { productImage } from "@cheshire/database/catalog";

export default function Content() {
  const banners = [...heroBanners].sort((a, b) => a.sortOrder - b.sortOrder);
  const active = banners.filter((b) => b.isActive).length;
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Banners</h1>
          <p className="mt-1 text-sm text-muted">
            Homepage hero carousel · {active} of {banners.length} active · auto-rotates every 6s
          </p>
        </div>
        <p className="text-xs uppercase tracking-[0.14em] text-muted">Source: packages/config → heroBanners</p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {banners.map((b) => (
          <article key={b.id} className="overflow-hidden border border-line bg-white">
            <div className={`relative grid aspect-[16/9] ${b.imageIds.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
              {b.imageIds.map((id) => (
                <div key={id} className="relative">
                  <Image src={productImage(id, 600)} alt="" fill sizes="(max-width:768px) 50vw, 16vw" className="object-cover" />
                </div>
              ))}
              <span className="absolute left-2 top-2 bg-black/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                #{b.sortOrder}
              </span>
              <span
                className={`absolute right-2 top-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                  b.isActive ? "bg-emerald-600 text-white" : "bg-gray-300 text-gray-700"
                }`}
              >
                {b.isActive ? "Active" : "Hidden"}
              </span>
            </div>
            <div className="p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">{b.eyebrow}</p>
              <p className="mt-1 text-lg font-semibold uppercase">
                {b.headline} {b.accent}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{b.supporting}</p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="text-muted">CTA</dt>
                  <dd>
                    {b.cta.label} → <code>{b.cta.href}</code>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Theme</dt>
                  <dd className="capitalize">{b.theme}</dd>
                </div>
              </dl>
              <Link
                href={`http://localhost:3000${b.cta.href}`}
                className="mt-3 inline-block text-xs font-semibold uppercase tracking-[0.14em] underline"
              >
                Preview link
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
