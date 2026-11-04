"use client";

import { useActionState, useState } from "react";
import { useResultToast } from "@/components/feedback";
import { saveStockAction, type FormState } from "@/lib/actions";

export function StockRow({ sku, sizes, stock, lowAt }: { sku: string; sizes: string[]; stock: Record<string, number>; lowAt: number }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveStockAction, {});
  useResultToast(state);
  const [values, setValues] = useState(stock);
  const dirty = sizes.some((s) => (values[s] ?? 0) !== (stock[s] ?? 0));
  return (
    <form action={action} className="flex flex-wrap items-end gap-1.5">
      <input type="hidden" name="sku" value={sku} />
      {sizes.map((s) => {
        const n = values[s] ?? 0;
        return (
          <label key={s} className="flex w-14 flex-col items-center">
            <span className="text-[10px] font-semibold text-muted">{s}</span>
            <input
              type="number"
              min={0}
              name={`stock_${s}`}
              value={n}
              aria-label={`Stock for size ${s}`}
              onChange={(e) => setValues((v) => ({ ...v, [s]: Number(e.target.value) }))}
              className={`input px-1.5 py-1 text-center text-xs tabular-nums ${n === 0 ? "!border-red-400 !bg-red-500/5" : n <= lowAt ? "!border-amber-400 !bg-amber-400/5" : ""}`}
            />
          </label>
        );
      })}
      <button className={`btn-primary px-2.5 py-1.5 ${dirty ? "" : "invisible"}`} disabled={pending}>
        {pending ? "…" : "Save"}
      </button>
    </form>
  );
}
