import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-deep">{eyebrow}</p> : null}
        <h1 className="font-display text-3xl uppercase leading-none tracking-wide sm:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-2xl text-sm text-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/** Marks numbers that are not backed by a real data source. */
export function DemoTag({ title = "No live data source yet — generated demo data" }: { title?: string }) {
  return (
    <span
      title={title}
      className="inline-flex items-center gap-1 rounded-full border border-dashed border-amber-500/60 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300"
    >
      Demo data
    </span>
  );
}

export function LiveTag({ title = "Computed from the committed catalogue / local admin store" }: { title?: string }) {
  return (
    <span
      title={title}
      className="inline-flex items-center gap-1 rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-deep"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Catalogue
    </span>
  );
}

export function Panel({
  title,
  tag,
  action,
  children,
  className = "",
  bodyClassName = "p-5",
}: {
  title?: ReactNode;
  tag?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`card overflow-hidden ${className}`}>
      {title ? (
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em]">{title}</h2>
            {tag}
          </div>
          {action}
        </header>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function Kpi({
  label,
  value,
  delta,
  hint,
  tag,
  tone = "default",
  href,
}: {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
  tag?: ReactNode;
  tone?: "default" | "gold" | "warn";
  href?: string;
}) {
  const body = (
    <div
      className={`card h-full p-4 transition ${href ? "hover:border-ink" : ""} ${
        tone === "gold" ? "!border-transparent !bg-gold text-white" : tone === "warn" ? "!border-amber-500/50" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${tone === "gold" ? "text-white/75" : "text-muted"}`}>{label}</p>
        {tag}
      </div>
      <p className="mt-3 font-display text-3xl leading-none tracking-wide">{value}</p>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {typeof delta === "number" ? (
          <span className={delta >= 0 ? "font-semibold text-emerald-600 dark:text-emerald-400" : "font-semibold text-red-600 dark:text-red-400"}>
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
          </span>
        ) : null}
        {hint ? <span className={tone === "gold" ? "text-white/75" : "text-muted"}>{hint}</span> : null}
      </div>
    </div>
  );
  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}

const pillTones: Record<string, string> = {
  green: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30",
  gold: "bg-gold-soft text-gold-deep ring-gold/30",
  amber: "bg-amber-400/15 text-amber-700 dark:text-amber-300 ring-amber-500/30",
  red: "bg-red-500/12 text-red-700 dark:text-red-300 ring-red-500/30",
  blue: "bg-sky-500/12 text-sky-700 dark:text-sky-300 ring-sky-500/30",
  gray: "bg-ink/5 text-muted ring-line",
  ink: "bg-ink text-bg ring-ink",
};

export type PillTone = keyof typeof pillTones;

export function Pill({ children, tone = "gray" }: { children: ReactNode; tone?: PillTone }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-inset ${pillTones[tone]}`}>
      {children}
    </span>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line p-10 text-center">
      <p className="font-display text-xl uppercase tracking-wide">{title}</p>
      {children ? <div className="mt-2 text-sm text-muted">{children}</div> : null}
    </div>
  );
}

export function Notice({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warn" }) {
  return (
    <div
      className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
        tone === "warn" ? "border-amber-500/40 bg-amber-400/10 text-amber-900 dark:text-amber-200" : "border-line bg-surface text-muted"
      }`}
    >
      {children}
    </div>
  );
}
