import Link from "next/link";
import { categories } from "@cheshire/database/catalog";
import { PageHeader, Pill, type PillTone } from "@/components/ui";
import { couponState, listCoupons } from "@/lib/coupons";
import { dateOnly, inr } from "@/lib/format";
import { toggleCouponAction } from "@/lib/actions";
import { ConfirmButton } from "@/components/feedback";
import { CouponForm } from "./CouponForm";

export const metadata = { title: "Coupons" };

const tone: Record<string, PillTone> = { active: "green", scheduled: "blue", expired: "gray", paused: "gray", "used up": "amber" };

export default async function CouponsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const coupons = listCoupons();
  const editing = coupons.find((c) => c.code === edit);
  return (
    <div>
      <PageHeader
        eyebrow="Sales"
        title="Coupons & discounts"
        subtitle="Create percentage, flat or free-shipping codes with minimum cart, category scope, usage limit and dates. Saved locally; storefront checkout isn't wired to these codes yet. Usage counts on the seeded codes are demo numbers."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="card overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-line">
              <tr>
                <th className="th">Code</th>
                <th className="th">Discount</th>
                <th className="th">Rules</th>
                <th className="th">Usage</th>
                <th className="th">Window</th>
                <th className="th">State</th>
                <th className="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {coupons.map((c) => {
                const st = couponState(c);
                const pct = c.usageLimit ? Math.min(100, (c.used / c.usageLimit) * 100) : 0;
                return (
                  <tr key={c.code} className={`hover:bg-ink/[0.03] ${edit === c.code ? "bg-gold-soft" : ""}`}>
                    <td className="td">
                      <code className="rounded bg-ink px-2 py-1 font-mono text-xs font-bold text-gold">{c.code}</code>
                      <div className="mt-1 text-xs text-muted">{c.description}</div>
                    </td>
                    <td className="td font-semibold">{c.type === "percent" ? `${c.value}% off` : c.type === "flat" ? `${inr(c.value)} off` : "Free shipping"}</td>
                    <td className="td text-xs text-muted">
                      {c.minSubtotal ? `Min ${inr(c.minSubtotal)}` : "No minimum"}
                      <div>{c.categories.length ? c.categories.map((s) => categories.find((x) => x.slug === s)?.name ?? s).join(", ") : "All categories"}</div>
                    </td>
                    <td className="td w-36 text-xs">
                      {c.used}
                      {c.usageLimit ? ` / ${c.usageLimit}` : " · unlimited"}
                      {c.usageLimit ? (
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink/10">
                          <div className="h-full bg-ink" style={{ width: `${pct}%` }} />
                        </div>
                      ) : null}
                    </td>
                    <td className="td whitespace-nowrap text-xs text-muted">
                      {dateOnly(c.startsAt)}
                      <div>→ {c.endsAt ? dateOnly(c.endsAt) : "no end"}</div>
                    </td>
                    <td className="td">
                      <Pill tone={tone[st]}>{st}</Pill>
                    </td>
                    <td className="td">
                      <div className="flex justify-end gap-1">
                        <Link href={`/coupons?edit=${c.code}`} className="btn-ghost px-2.5 py-1.5">
                          Edit
                        </Link>
                        <ConfirmButton
                          className="btn-ghost px-2.5 py-1.5"
                          run={toggleCouponAction.bind(null, c.code)}
                          confirm={
                            c.active
                              ? { title: `Pause ${c.code}?`, body: "Shoppers won't be able to use this code until you resume it.", confirmLabel: "Pause code", tone: "danger" }
                              : undefined
                          }
                        >
                          {c.active ? "Pause" : "Resume"}
                        </ConfirmButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <aside className="xl:sticky xl:top-24 xl:self-start">
          <CouponForm key={editing?.code ?? "new"} coupon={editing} categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />
        </aside>
      </div>
    </div>
  );
}
