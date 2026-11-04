"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { heroBanners, type HeroBanner } from "@cheshire/config";
import { productImage } from "@cheshire/database/catalog";

/** Calm, editorial pace. */
const INTERVAL_MS = 6000;

/** Accessible name for a slide: the headline as it reads on the artwork. */
const slideTitle = (b: HeroBanner) => `${b.headline} ${b.accent}`.replace(/\s+/g, " ").trim();

/**
 * Homepage hero carousel. Slides with `image` are finished artwork (text + "Shop now" baked in): shown whole
 * at 3:2 with object-contain and linked to `cta.href`. Slides without one fall back to the editorial text layout.
 * `banners` comes from the server (page.tsx → @cheshire/config/banner-store): the admin-managed
 * `.data/hero-banners.json` when present, otherwise the committed defaults.
 */
export function Hero({ banners = heroBanners }: { banners?: HeroBanner[] }) {
  const slides = banners.filter((b) => b.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = slides.length;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    if (paused || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => go(index + 1), INTERVAL_MS);
    return () => window.clearTimeout(t);
  }, [index, paused, count, go]);

  if (!count) return null;

  return (
    <section
      className="relative isolate bg-ivory"
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      <h1 className="sr-only">Cheshire — Roots. Remixed.</h1>
      <div className="mx-auto grid max-w-[1180px] sm:px-6 sm:pt-6 lg:px-10 lg:pt-8">
        {slides.map((b, i) => {
          const active = i === index;
          if (b.image) {
            const size = b.imageSize ?? { width: 1168, height: 784 };
            return (
              <div
                key={b.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}: ${slideTitle(b)}`}
                aria-hidden={!active}
                className={`col-start-1 row-start-1 transition-opacity duration-[900ms] ease-luxe motion-reduce:transition-none ${
                  active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"
                }`}
              >
                <Link
                  href={b.cta.href}
                  tabIndex={active ? 0 : -1}
                  className="group relative block aspect-[3/2] overflow-hidden bg-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:rounded-md sm:shadow-soft"
                >
                  <Image
                    src={b.image}
                    alt={`${slideTitle(b)} — ${b.cta.label}`}
                    width={size.width}
                    height={size.height}
                    priority={i === 0}
                    loading={i === 0 ? undefined : "lazy"}
                    fetchPriority={i === 0 ? "high" : "low"}
                    sizes="(max-width: 1180px) 100vw, 1100px"
                    className="h-full w-full object-contain"
                  />
                </Link>
              </div>
            );
          }
          const dark = b.theme === "dark";
          const [main, inset] = b.imageIds;
          return (
            <div
              key={b.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={!active}
              className={`col-start-1 row-start-1 grid transition-opacity duration-[1400ms] ease-luxe md:grid-cols-12 ${
                active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"
              } ${dark ? "bg-ink text-ivory" : "bg-ivory text-ink"}`}
            >
              {/* Image */}
              <div className="relative md:order-2 md:col-span-7">
                <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[16/11] md:aspect-auto md:h-full md:min-h-[78svh]">
                  <Image
                    src={productImage(main ?? "", 1600)}
                    alt=""
                    fill
                    priority={i === 0}
                    sizes="(max-width: 768px) 100vw, 60vw"
                    className={`object-cover object-[50%_25%] transition-transform duration-[9000ms] ease-out ${active ? "scale-100" : "scale-[1.04]"}`}
                  />
                </div>
                {inset ? (
                  <div className="absolute -bottom-10 left-4 hidden w-[30%] max-w-[220px] overflow-hidden rounded-sm border-[6px] border-ivory shadow-lift md:-left-16 md:bottom-12 md:block">
                    <div className="relative aspect-[3/4]">
                      <Image src={productImage(inset, 500)} alt="" fill sizes="220px" className="object-cover" />
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Copy */}
              <div className="flex flex-col justify-center px-5 pb-12 pt-8 sm:px-8 md:order-1 md:col-span-5 md:py-16 md:pl-10 md:pr-20 lg:pl-16">
                <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${dark ? "text-gold-soft" : "text-gold"}`}>{b.eyebrow}</p>
                  <h2 className="mt-5 font-serif text-[3.2rem] font-medium leading-[0.95] tracking-[-0.02em] sm:text-7xl lg:text-[6rem]">
                    {b.headline}
                    <br />
                    <span className="italic text-gold">{b.accent}</span>
                  </h2>
                <p className={`mt-6 max-w-sm text-[15px] leading-relaxed ${dark ? "text-ivory/75" : "text-muted"}`}>{b.supporting}</p>
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <Link href={b.cta.href} tabIndex={active ? 0 : -1} className={dark ? "btn-gold" : "btn-primary"}>
                    {b.cta.label}
                  </Link>
                  {b.secondaryCta ? (
                    <Link href={b.secondaryCta.href} tabIndex={active ? 0 : -1} className="link-arrow">
                      {b.secondaryCta.label}
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {count > 1 ? (
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-5 py-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-2 sm:gap-3" role="tablist" aria-label="Choose slide">
            {slides.map((b, i) => (
              <button
                key={b.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}: ${slideTitle(b)}`}
                onClick={() => go(i)}
                className="group py-2"
              >
                <span className={`block h-px transition-all duration-700 ${i === index ? "w-8 bg-ink sm:w-12" : "w-3 bg-ink/25 group-hover:bg-ink/50 sm:w-6"}`} />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            <span className="whitespace-nowrap tabular-nums">
              {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
            <button type="button" onClick={() => go(index - 1)} aria-label="Previous slide" className="hover:text-ink">
              ←
            </button>
            <button type="button" onClick={() => go(index + 1)} aria-label="Next slide" className="hover:text-ink">
              →
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
