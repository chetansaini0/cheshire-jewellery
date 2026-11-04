"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "./Icon";

export type ChecklistItem = { id: string; title: string; detail: string; href: string; done: boolean };

const KEY = "ch-admin-checklist-hidden";

export function GettingStarted({ items }: { items: ChecklistItem[] }) {
  const [hidden, setHidden] = useState(true);
  useEffect(() => setHidden(localStorage.getItem(KEY) === "1"), []);
  const done = items.filter((i) => i.done).length;
  if (hidden || done === items.length) return null;
  return (
    <section className="card mb-6 overflow-hidden" aria-labelledby="getting-started">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <div>
          <h2 id="getting-started" className="text-sm font-semibold uppercase tracking-[0.12em]">
            Getting started
          </h2>
          <p className="text-xs text-muted">
            {done} of {items.length} done. Finish these to get the most out of your admin.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-ink/10" aria-hidden>
            <div className="h-full bg-lime-ink" style={{ width: `${(done / items.length) * 100}%` }} />
          </div>
          <button
            type="button"
            className="text-xs text-muted hover:text-ink"
            onClick={() => {
              localStorage.setItem(KEY, "1");
              setHidden(true);
            }}
          >
            Hide
          </button>
        </div>
      </header>
      <ol className="grid divide-y divide-line sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3">
        {items.map((item, i) => (
          <li key={item.id} className="sm:border-b sm:border-line">
            <Link href={item.href} className="flex h-full items-start gap-3 px-5 py-4 transition hover:bg-ink/[0.03]">
              <span
                className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                  item.done ? "bg-lime text-[#0A0A0A]" : "border border-line text-muted"
                }`}
                aria-label={item.done ? "Done" : `Step ${i + 1}`}
              >
                {item.done ? <Icon name="check" className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span>
                <span className={`block text-sm font-semibold ${item.done ? "text-muted line-through" : ""}`}>{item.title}</span>
                <span className="block text-xs text-muted">{item.detail}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
