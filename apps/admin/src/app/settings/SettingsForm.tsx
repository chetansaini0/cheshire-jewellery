"use client";

import { useActionState, useRef } from "react";
import { SaveHint, useResultToast, useUnsavedChanges } from "@/components/feedback";
import { saveSettingsAction, type FormState } from "@/lib/actions";
import type { StoreSettings } from "@/lib/settings";

export function SettingsForm({ settings, dataDir }: { settings: StoreSettings; dataDir: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveSettingsAction, {});
  const formRef = useRef<HTMLFormElement>(null);
  useResultToast(state);
  const { dirty } = useUnsavedChanges(formRef, state);
  const err = state.errors ?? {};
  const f = (name: keyof StoreSettings, label: string, type = "text", hint?: string) => (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} defaultValue={String(settings[name])} className={`input ${err[name] ? "!border-red-500" : ""}`} min={type === "number" ? 0 : undefined} />
      {err[name] ? <p className="mt-1 text-xs text-red-600">{err[name]}</p> : hint ? <p className="mt-1 text-[11px] text-muted">{hint}</p> : null}
    </div>
  );
  return (
    <form ref={formRef} action={action} className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <section className="card grid gap-4 p-5 sm:grid-cols-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] sm:col-span-2">Store</h2>
          {f("storeName", "Store name")}
          {f("supportEmail", "Support email", "email")}
          {f("supportPhone", "Support phone")}
          <div className="sm:col-span-2">{f("announcement", "Announcement bar text", "text", "The thin strip of text at the very top of the store (for your reference until it's wired to the storefront).")}</div>
        </section>
        <section className="card grid gap-4 p-5 sm:grid-cols-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] sm:col-span-2">Shipping & tax</h2>
          {f("freeShippingThreshold", "Free delivery above (₹)", "number", "Orders at or above this amount ship free.")}
          {f("standardShippingFee", "Delivery charge (₹)", "number", "Charged on orders below the free-delivery amount.")}
          {f("gstPercent", "GST (%)", "number", "Apparel above ₹1,000 attracts 12% GST.")}
          <label className="flex items-center gap-2 self-end pb-2 text-sm">
            <input type="checkbox" name="codEnabled" defaultChecked={settings.codEnabled} className="h-4 w-4 accent-[#0A0A0A]" /> Cash on delivery enabled
          </label>
        </section>
        <section className="card grid gap-4 p-5 sm:grid-cols-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] sm:col-span-2">Inventory</h2>
          {f("lowStockThreshold", "Warn me when stock is at or below", "number", "Number of pieces. Used for dashboard alerts, the Inventory “low” filter and the stock.low automation.")}
        </section>
      </div>
      <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <div className="card p-5 text-sm text-muted">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-ink">Where this is stored</h2>
          Your changes are saved on this computer in <code className="break-all text-xs">{dataDir}</code>. They are not uploaded anywhere. Once a database is connected, the online admin will save too.
        </div>
        <div className="card p-4">
          <button className="btn-lime w-full py-3" disabled={pending}>
            {pending ? "Saving…" : "Save settings"}
          </button>
          <div className="mt-2">
            <SaveHint dirty={dirty} />
          </div>
        </div>
      </aside>
    </form>
  );
}
