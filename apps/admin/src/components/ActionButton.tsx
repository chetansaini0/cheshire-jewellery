"use client";

import { useState, useTransition } from "react";

export function ActionButton({
  label,
  run,
  tone = "gold",
}: {
  label: string;
  run: () => Promise<unknown>;
  tone?: "gold" | "quiet";
}) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            try {
              const result = await run();
              setMessage(typeof result === "string" ? result : JSON.stringify(result).slice(0, 180));
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "Failed");
            }
          })
        }
        className={
          tone === "gold"
            ? "border border-gold bg-gold/10 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-gold-deep disabled:opacity-50"
            : "border border-line px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-muted disabled:opacity-50"
        }
      >
        {pending ? "Working…" : label}
      </button>
      {message ? <span className="max-w-xs text-[11px] text-muted">{message}</span> : null}
    </span>
  );
}
