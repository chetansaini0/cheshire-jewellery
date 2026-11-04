"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useConfirm, useLeaveGuard, useToast } from "@/components/feedback";
import type { HeroBanner } from "@cheshire/config";
import { Icon } from "@/components/Icon";
import { Thumb } from "@/components/Thumb";
import { Pill } from "@/components/ui";
import { resetBannersAction, saveBannersAction } from "@/lib/actions";

import { MAX_ACTIVE_BANNERS as MAX_ACTIVE } from "@cheshire/config";

const blank = (n: number): HeroBanner => ({
  id: `banner-${n}`,
  eyebrow: "New drop",
  headline: "New",
  accent: "banner.",
  supporting: "Short supporting line for the slide.",
  cta: { label: "Shop now", href: "/shop" },
  imageIds: ["px:29370686"],
  theme: "dark",
  isActive: false,
  sortOrder: n,
});

function Preview({ b, compact = false }: { b: HeroBanner; compact?: boolean }) {
  if (b.image) {
    // Finished artwork: shown whole at 3:2, exactly as the storefront renders it.
    return (
      <div className="relative aspect-[3/2] overflow-hidden rounded-md border border-line bg-[#F7F5F0]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={b.image} alt={`${b.headline} ${b.accent}`} loading="lazy" className="h-full w-full object-contain" />
      </div>
    );
  }
  // Mirrors the storefront hero: editorial copy on the left, photography on the right.
  const dark = b.theme === "dark";
  return (
    <div
      className={`grid overflow-hidden rounded-md border border-line ${compact ? "aspect-[16/7]" : "aspect-[16/8]"} grid-cols-[5fr_7fr] ${
        dark ? "bg-[#111111] text-[#F7F5F0]" : "bg-[#F7F5F0] text-[#111111]"
      }`}
    >
      <div className={`flex min-w-0 flex-col justify-center ${compact ? "p-3" : "p-6 sm:p-8"}`}>
        <span className={`font-semibold uppercase tracking-[0.22em] text-gold ${compact ? "text-[7px]" : "text-[10px]"}`}>{b.eyebrow}</span>
        <p className={`mt-2 font-serif leading-[0.95] ${compact ? "text-lg" : "text-4xl sm:text-5xl"}`}>
          {b.headline}
          <br />
          <span className="italic text-gold">{b.accent}</span>
        </p>
        {!compact ? (
          <>
            <p className={`mt-3 max-w-xs text-sm ${dark ? "text-white/70" : "text-[#6B6560]"}`}>{b.supporting}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className={`rounded-sm px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] ${dark ? "bg-[#F7F5F0] text-[#111111]" : "bg-[#111111] text-[#F7F5F0]"}`}>{b.cta.label}</span>
              {b.secondaryCta?.label ? (
                <span className="border-b border-current px-1 py-2 text-[10px] font-semibold uppercase tracking-[0.16em]">{b.secondaryCta.label}</span>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
      <div className={`relative grid ${b.imageIds.length > 1 ? "grid-cols-[2fr_1fr]" : "grid-cols-1"} gap-px`}>
        {b.imageIds.map((id, k) => (
          <Thumb key={`${id}-${k}`} id={id} alt="" className="h-full w-full !rounded-none" w={compact ? 400 : 900} />
        ))}
      </div>
    </div>
  );
}

export function BannerManager({
  initial,
  source,
  filePath,
  storefrontUrl,
}: {
  initial: HeroBanner[];
  source: "file" | "config";
  filePath: string;
  storefrontUrl: string;
}) {
  const [list, setList] = useState<HeroBanner[]>(initial);
  const [selected, setSelected] = useState(initial[0]?.id ?? "");
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const toast = useToast();
  const confirm = useConfirm();
  const setMessage = (m: { ok: boolean; text: string }) => m.text && toast(m.text, m.ok ? "success" : "error");
  const [pending, start] = useTransition();
  const [src, setSrc] = useState(source);

  const dirty = JSON.stringify(list) !== saved;
  useLeaveGuard(dirty);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        document.getElementById("banner-save")?.click();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const activeCount = list.filter((b) => b.isActive).length;
  const current = list.find((b) => b.id === selected);
  const idx = list.findIndex((b) => b.id === selected);
  const ordered = useMemo(() => list.map((b, i) => ({ ...b, sortOrder: i + 1 })), [list]);

  const update = (patch: Partial<HeroBanner>) => setList((l) => l.map((b) => (b.id === selected ? { ...b, ...patch } : b)));
  const move = (i: number, dir: -1 | 1) =>
    setList((l) => {
      const j = i + dir;
      if (j < 0 || j >= l.length) return l;
      const next = [...l];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const toggle = (id: string) =>
    setList((l) =>
      l.map((b) => {
        if (b.id !== id) return b;
        if (!b.isActive && l.filter((x) => x.isActive).length >= MAX_ACTIVE) {
          setMessage({ ok: false, text: `Only ${MAX_ACTIVE} banners can be active. Hide one first.` });
          return b;
        }
        return { ...b, isActive: !b.isActive };
      })
    );
  const add = () => {
    let n = list.length + 1;
    while (list.some((b) => b.id === `banner-${n}`)) n++;
    const b = blank(n);
    setList((l) => [...l, b]);
    setSelected(b.id);
  };
  const remove = async (id: string) => {
    if (
      !(await confirm({
        title: "Remove this banner?",
        body: "It disappears from the list now and from the store when you press Save & publish. You can always reset to the original banners.",
        confirmLabel: "Remove banner",
        tone: "danger",
      }))
    )
      return;
    setList((l) => l.filter((b) => b.id !== id));
    setSelected(list.find((b) => b.id !== id)?.id ?? "");
  };
  const save = () =>
    start(async () => {
      const r = await saveBannersAction(ordered);
      setMessage({ ok: Boolean(r.ok), text: r.message ?? "" });
      if (r.ok) {
        setSaved(JSON.stringify(list));
        setSrc("file");
      }
    });
  const reset = async () => {
    if (
      !(await confirm({
        title: "Reset all banners?",
        body: "This throws away every banner change you've saved and goes back to the original 5 banners.",
        confirmLabel: "Reset banners",
        tone: "danger",
      }))
    )
      return;
    start(async () => {
      const r = await resetBannersAction();
      setMessage({ ok: Boolean(r.ok), text: r.message ?? "" });
      if (r.ok) setTimeout(() => window.location.reload(), 600);
    });
  };

  return (
    <div>
      <div className="card mb-6 flex flex-wrap items-center gap-3 p-4 text-sm">
        <Pill tone={src === "file" ? "gold" : "gray"}>{src === "file" ? "Your saved banners" : "Original banners"}</Pill>
        <span className="text-muted" title={filePath}>
          {src === "file"
            ? "The store on this computer shows these banners. The live (Vercel) site keeps the original set until a database is connected."
            : "These are the original banners. Edit and press Save & publish to make your own version."}
        </span>
        <span className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted">
            {activeCount}/{MAX_ACTIVE} active
          </span>
          {src === "file" ? (
            <button type="button" className="btn-ghost" onClick={reset} disabled={pending}>
              Reset to original
            </button>
          ) : null}
          <a href={storefrontUrl} target="_blank" rel="noreferrer" className="btn-ghost">
            <Icon name="external" /> Storefront
          </a>
          <button id="banner-save" type="button" className="btn-gold" onClick={save} disabled={!dirty || pending} title="Ctrl + S">
            {pending ? "Saving…" : dirty ? "Save & publish" : "Saved"}
          </button>
        </span>
      </div>
      {dirty ? (
        <p className="mb-4 flex items-center gap-2 rounded-md bg-amber-400/10 px-4 py-2 text-sm text-amber-800 dark:text-amber-200" role="status">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> You have unsaved banner changes. Press <strong>Save &amp; publish</strong> (or Ctrl + S) to put them live.
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <div className="space-y-3">
          {list.map((b, i) => (
            <div
              key={b.id}
              className={`card cursor-pointer overflow-hidden transition ${selected === b.id ? "ring-2 ring-ink" : "hover:border-ink"} ${b.isActive ? "" : "opacity-60"}`}
              onClick={() => setSelected(b.id)}
            >
              <div className="relative">
                <Preview b={b} compact />
                <span className="absolute left-2 top-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white">#{i + 1}</span>
              </div>
              <div className="flex items-center gap-1 p-2" onClick={(e) => e.stopPropagation()}>
                <span className="min-w-0 flex-1 truncate px-1 text-xs font-semibold">{b.eyebrow}</span>
                <button type="button" className="btn-ghost px-2 py-1.5" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                  <Icon name="up" className="h-3.5 w-3.5" />
                </button>
                <button type="button" className="btn-ghost px-2 py-1.5" onClick={() => move(i, 1)} disabled={i === list.length - 1} aria-label="Move down">
                  <Icon name="down" className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => toggle(b.id)}
                  className={`relative h-6 w-11 rounded-full transition ${b.isActive ? "bg-gold" : "bg-ink/20"}`}
                  role="switch"
                  aria-checked={b.isActive}
                  aria-label={`${b.isActive ? "Hide" : "Show"} ${b.eyebrow}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${b.isActive ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={add} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line p-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted hover:border-ink hover:text-ink">
            <Icon name="plus" /> Add banner
          </button>
        </div>

        {current ? (
          <div className="space-y-6">
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.12em]">Live preview · slide {idx + 1}</h2>
                <Pill tone={current.isActive ? "green" : "gray"}>{current.isActive ? "Active" : "Hidden"}</Pill>
              </div>
              <Preview b={current} />
            </div>
            <div className="card grid gap-4 p-5 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="b-id">ID</label>
                <input id="b-id" className="input font-mono text-xs" value={current.id} onChange={(e) => {
                  const id = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                  update({ id });
                  setSelected(id);
                }} />
              </div>
              <div>
                <label className="label" htmlFor="b-eyebrow">Eyebrow</label>
                <input id="b-eyebrow" className="input" value={current.eyebrow} maxLength={80} onChange={(e) => update({ eyebrow: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="b-headline">Headline</label>
                <input id="b-headline" className="input" value={current.headline} maxLength={40} onChange={(e) => update({ headline: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="b-accent">Accent line (gold italic)</label>
                <input id="b-accent" className="input" value={current.accent} maxLength={40} onChange={(e) => update({ accent: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="b-supporting">Supporting copy</label>
                <textarea id="b-supporting" className="input" rows={2} maxLength={240} value={current.supporting} onChange={(e) => update({ supporting: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="b-cta-label">Primary button</label>
                <input id="b-cta-label" className="input" value={current.cta.label} onChange={(e) => update({ cta: { ...current.cta, label: e.target.value } })} />
              </div>
              <div>
                <label className="label" htmlFor="b-cta-href">Primary link</label>
                <input id="b-cta-href" className="input font-mono text-xs" value={current.cta.href} onChange={(e) => update({ cta: { ...current.cta, href: e.target.value } })} placeholder="/shop/lehengas" />
              </div>
              <div>
                <label className="label" htmlFor="b-sec-label">Secondary button (optional)</label>
                <input
                  id="b-sec-label"
                  className="input"
                  value={current.secondaryCta?.label ?? ""}
                  onChange={(e) => update({ secondaryCta: e.target.value || current.secondaryCta?.href ? { label: e.target.value, href: current.secondaryCta?.href ?? "" } : undefined })}
                />
              </div>
              <div>
                <label className="label" htmlFor="b-sec-href">Secondary link</label>
                <input
                  id="b-sec-href"
                  className="input font-mono text-xs"
                  value={current.secondaryCta?.href ?? ""}
                  onChange={(e) => update({ secondaryCta: e.target.value || current.secondaryCta?.label ? { label: current.secondaryCta?.label ?? "", href: e.target.value } : undefined })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="b-image">Full banner image (text already on it)</label>
                <input
                  id="b-image"
                  className="input font-mono text-xs"
                  placeholder="/banners/banner-01-wear-the-mix-v2.webp"
                  value={current.image ?? ""}
                  onChange={(e) => update({ image: e.target.value.trim() || undefined })}
                />
                <p className="mt-1 text-xs text-muted">
                  Put the file in <code>apps/web/public/banners</code> (and <code>apps/admin/public/banners</code> for this preview). The whole image links to the primary link above. Leave empty to use photos + text instead.
                </p>
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="b-images">Photos for a text banner (1–2): Unsplash photo-… or Pexels px:&lt;id&gt;, one per line</label>
                <textarea
                  id="b-images"
                  className="input font-mono text-xs"
                  rows={2}
                  value={current.imageIds.join("\n")}
                  onChange={(e) => {
                    const ids = e.target.value.split(/[\n,]/).map((s) => s.trim()).filter(Boolean).slice(0, 2);
                    update({ imageIds: ids });
                  }}
                />
              </div>
              <div>
                <span className="label">Theme</span>
                <div className="grid grid-cols-2 gap-2">
                  {(["light", "dark"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => update({ theme: t })}
                      className={`rounded-md border px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${current.theme === t ? "border-gold ring-2 ring-gold/40" : "border-line"} ${t === "light" ? "bg-[#F7F5F0] text-[#111111]" : "bg-[#111111] text-white"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-end justify-end">
                <button type="button" className="btn-danger" onClick={() => remove(current.id)}>
                  <Icon name="trash" /> Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">Select a banner to edit.</p>
        )}
      </div>
    </div>
  );
}
