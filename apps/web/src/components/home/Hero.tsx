"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { heroBanners } from "@cheshire/config";
import { productImage } from "@cheshire/database/catalog";

const INTERVAL_MS = 6000;

export function Hero() {
  const slides = heroBanners.filter((b) => b.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
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
      className="relative isolate overflow-hidden bg-ink text-ivory"
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
      <div className="relative min-h-[82svh] md:min-h-[86svh]">
        {slides.map((b, i) => {
          const active = i === index;
          const lime = b.theme === "lime";
          return (
            <div
              key={b.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}: ${b.eyebrow}`}
              aria-hidden={!active}
              className={`absolute inset-0 transition-opacity duration-700 ease-luxe ${
                active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"
              } ${lime ? "bg-gold text-ink" : ""}`}
            >
              <div className={`absolute inset-0 -z-10 grid grid-cols-1 ${b.imageIds.length > 1 ? "md:grid-cols-2" : ""}`}>
                {b.imageIds.map((id, k) => (
                  <div key={id} className={`relative ${k > 0 ? "hidden md:block" : ""}`}>
                    <Image
                      src={productImage(id, 1400)}
                      alt=""
                      fill
                      priority={i === 0}
                      loading={i === 0 ? undefined : "lazy"}
                      sizes={b.imageIds.length > 1 ? "(max-width:768px) 100vw, 50vw" : "100vw"}
                      className={`object-cover transition-transform duration-[7000ms] ease-out ${active ? "scale-105" : "scale-100"}`}
                    />
                  </div>
                ))}
                <div
                  className={`absolute inset-0 ${
                    lime ? "bg-gradient-to-t from-gold via-gold/40 to-transparent" : "bg-gradient-to-t from-ink via-ink/35 to-ink/10"
                  }`}
                />
              </div>

              <div className="mx-auto flex h-full min-h-[82svh] max-w-site flex-col justify-end px-4 pb-20 pt-28 sm:px-6 md:min-h-[86svh] lg:px-10 lg:pb-24">
                <p
                  className={`inline-flex w-fit items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${
                    lime ? "bg-ink text-gold" : "bg-gold text-ink"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${lime ? "bg-gold" : "bg-ink"}`} /> {b.eyebrow}
                </p>
                {i === 0 ? (
                  <h1 className="mt-5 font-serif text-[17vw] uppercase leading-[0.82] tracking-tight md:text-[10.5vw] xl:text-[10rem]">
                    {b.headline}
                    <br />
                    <span className={lime ? "text-stroke-ink" : "text-stroke"}>{b.accent}</span>
                  </h1>
                ) : (
                  <h2 className="mt-5 font-serif text-[17vw] uppercase leading-[0.82] tracking-tight md:text-[10.5vw] xl:text-[10rem]">
                    {b.headline}
                    <br />
                    <span className={lime ? "text-stroke-ink" : "text-stroke"}>{b.accent}</span>
                  </h2>
                )}
                <div className="mt-6 flex flex-col gap-5 md:mt-8 md:flex-row md:items-end md:justify-between">
                  <p className={`max-w-md text-sm leading-relaxed md:text-base ${lime ? "text-ink/80" : "text-ivory/80"}`}>
                    {b.supporting}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={b.cta.href}
                      tabIndex={active ? 0 : -1}
                      className={lime ? "inline-block rounded-full bg-ink px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory transition hover:bg-ink/85" : "btn-primary"}
                    >
                      {b.cta.label}
                    </Link>
                    {b.secondaryCta ? (
                      <Link href={b.secondaryCta.href} tabIndex={active ? 0 : -1} className="btn-outline-gold">
                        {b.secondaryCta.label}
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {count > 1 ? (
        <div className="absolute inset-x-0 bottom-0 z-20">
          <div className="mx-auto flex max-w-site items-center justify-between gap-4 px-4 pb-5 sm:px-6 lg:px-10">
            <div className="flex items-center gap-2" role="tablist" aria-label="Choose slide">
              {slides.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Go to slide ${i + 1}: ${b.eyebrow}`}
                  onClick={() => go(i)}
                  className="group flex h-6 items-center"
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all duration-300 ${
                      i === index ? "w-10 bg-gold" : "w-4 bg-ivory/50 group-hover:bg-ivory"
                    } ${slides[index]?.theme === "lime" && i !== index ? "!bg-ink/40" : ""} ${
                      slides[index]?.theme === "lime" && i === index ? "!bg-ink" : ""
                    }`}
                  />
                </button>
              ))}
              <span className={`ml-2 text-[11px] font-semibold tabular-nums ${slides[index]?.theme === "lime" ? "text-ink" : "text-ivory/70"}`}>
                {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </span>
            </div>
            <div className="flex gap-2">
              {[
                { label: "Previous slide", dir: -1, glyph: "←" },
                { label: "Next slide", dir: 1, glyph: "→" },
              ].map((a) => (
                <button
                  key={a.label}
                  type="button"
                  aria-label={a.label}
                  onClick={() => go(index + a.dir)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border text-lg transition ${
                    slides[index]?.theme === "lime"
                      ? "border-ink/40 text-ink hover:bg-ink hover:text-gold"
                      : "border-ivory/40 text-ivory hover:bg-ivory hover:text-ink"
                  }`}
                >
                  {a.glyph}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
