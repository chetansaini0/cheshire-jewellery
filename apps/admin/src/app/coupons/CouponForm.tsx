"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { Hint, SaveHint, useResultToast, useUnsavedChanges } from "@/components/feedback";
import { saveCouponAction, type FormState } from "@/lib/actions";
import type { Coupon, CouponType } from "@/lib/coupons";

export function CouponForm({ coupon, categories }: { coupon?: Coupon; categories: Array<{ slug: string; name: string }> }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveCouponAction, {});
  const formRef = useRef<HTMLFormElement>(null);
  useResultToast(state);
  const { dirty } = useUnsavedChanges(formRef, state);
  const [type, setType] = useState<CouponType>(coupon?.type ?? "percent");
  const err = state.errors ?? {};
  const today = new Date().toISOString().slice(0, 10);
  const e = (k: string) => (err[k] ? <p className="mt-1 text-xs text-red-600">{err[k]}</p> : null);
  return (
    <form ref={formRef} action={action} className="card space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em]">{coupon ? `Edit ${coupon.code}` : "New coupon"}</h2>
        {coupon ? (
          <Link href="/coupons" className="text-xs text-muted hover:text-ink">
            + New instead
          </Link>
        ) : null}
      </div>
      <input type="hidden" name="originalCode" value={coupon?.code ?? ""} />
      <input type="hidden" name="used" value={coupon?.used ?? 0} />
      <div>
        <label className="label" htmlFor="code">Discount code<Hint>What shoppers type at checkout. Letters and numbers only, e.g. DIWALI20.</Hint></label>
        <input id="code" name="code" defaultValue={coupon?.code} className="input font-mono uppercase" placeholder="DIWALI20" required />
        {e("code")}
      </div>
      <div>
        <label className="label" htmlFor="description">Internal note</label>
        <input id="description" name="description" defaultValue={coupon?.description} className="input" placeholder="Only you see this, e.g. Diwali Instagram campaign" />
      </div>
      <div>
        <span className="label">What does it give?</span>
        <input type="hidden" name="type" value={type} />
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["percent", "% off"],
              ["flat", "₹ off"],
              ["free_shipping", "Free delivery"],
            ] as const
          ).map(([t, label]) => (
            <button key={t} type="button" onClick={() => setType(t)} className={`rounded-md border px-2 py-2 text-xs font-semibold ${type === t ? "border-ink bg-ink text-bg" : "border-line text-muted"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {type !== "free_shipping" ? (
          <div>
            <label className="label" htmlFor="value">{type === "percent" ? "Discount (%)" : "Discount (₹)"}</label>
            <input id="value" name="value" type="number" min={1} defaultValue={coupon?.value || ""} className="input" />
            {e("value")}
          </div>
        ) : null}
        <div>
          <label className="label" htmlFor="minSubtotal">Minimum order (₹)<Hint>The cart must be at least this much before the code works. 0 means any amount.</Hint></label>
          <input id="minSubtotal" name="minSubtotal" type="number" min={0} defaultValue={coupon?.minSubtotal ?? 0} className="input" />
          {e("minSubtotal")}
        </div>
        <div>
          <label className="label" htmlFor="usageLimit">Times it can be used<Hint>Total uses across all shoppers. Leave 0 for unlimited.</Hint></label>
          <input id="usageLimit" name="usageLimit" type="number" min={0} defaultValue={coupon?.usageLimit ?? 0} className="input" />
                  </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="startsAt">Starts on</label>
          <input id="startsAt" name="startsAt" type="date" defaultValue={coupon?.startsAt ?? today} className="input" />
          {e("startsAt")}
        </div>
        <div>
          <label className="label" htmlFor="endsAt">Ends on<Hint>Leave empty to keep it running until you pause it.</Hint></label>
          <input id="endsAt" name="endsAt" type="date" defaultValue={coupon?.endsAt} className="input" />
          {e("endsAt")}
        </div>
      </div>
      <fieldset>
        <legend className="label">Only for these categories<Hint>Leave all unselected to allow the code on every product.</Hint></legend>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <label key={c.slug} className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-bg">
              <input type="checkbox" name="categories" value={c.slug} defaultChecked={coupon?.categories.includes(c.slug)} className="sr-only" />
              {c.name}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={coupon?.active ?? true} className="h-4 w-4 accent-[#A6844A]" /> Code is switched on
      </label>
      <button className="btn-gold w-full" disabled={pending}>
        {pending ? "Saving…" : coupon ? "Save coupon" : "Create coupon"}
      </button>
      <SaveHint dirty={dirty} />
    </form>
  );
}
