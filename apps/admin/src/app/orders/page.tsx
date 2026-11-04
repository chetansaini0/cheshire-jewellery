import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Thumb } from "@/components/Thumb";
import { DemoTag, PageHeader, Pill } from "@/components/ui";
import { dateTime, inr } from "@/lib/format";
import { listOrders, ORDER_STATUSES, statusTone, type OrderStatus } from "@/lib/orders";

export const metadata = { title: "Orders" };

const PAGE = 25;

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string; payment?: string }> }) {
  const sp = await searchParams;
  const all = listOrders();
  const status = ORDER_STATUSES.includes(sp.status as OrderStatus) ? (sp.status as OrderStatus) : undefined;
  const q = (sp.q ?? "").trim().toLowerCase();
  const filtered = all
    .filter((o) => !status || o.status === status)
    .filter((o) => !sp.payment || o.payment === sp.payment)
    .filter((o) => !q || `${o.id} ${o.customer.name} ${o.customer.email} ${o.customer.city} ${o.lines.map((l) => `${l.sku} ${l.name}`).join(" ")}`.toLowerCase().includes(q));
  const page = Math.max(1, Number(sp.page) || 1);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const rows = filtered.slice((page - 1) * PAGE, page * PAGE);
  const counts = Object.fromEntries(ORDER_STATUSES.map((s) => [s, all.filter((o) => o.status === s).length]));
  const href = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { status, q: sp.q, payment: sp.payment, page: undefined as string | undefined, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return `/orders${s ? `?${s}` : ""}`;
  };

  return (
    <div>
      <PageHeader
        eyebrow="Sales"
        title="Orders"
        subtitle="Demo orders generated from the real catalogue — there's no order database yet. Status changes you make here are saved locally and show in the timeline."
        actions={<DemoTag />}
      />

      <div className="no-scrollbar -mx-1 mb-4 flex gap-2 overflow-x-auto px-1">
        <Link href={href({ status: undefined })} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${!status ? "border-ink bg-ink text-bg" : "border-line bg-surface text-muted hover:text-ink"}`}>
          All <span className="opacity-60">{all.length}</span>
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            href={href({ status: s })}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${status === s ? "border-ink bg-ink text-bg" : "border-line bg-surface text-muted hover:text-ink"}`}
          >
            {s} <span className="opacity-60">{counts[s]}</span>
          </Link>
        ))}
      </div>

      <form className="card mb-4 grid gap-3 p-3 sm:grid-cols-[1fr_180px_auto]" action="/orders">
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <div className="relative">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={sp.q} placeholder="Order #, customer, city, SKU…" className="input pl-9" aria-label="Search orders" />
        </div>
        <select name="payment" defaultValue={sp.payment ?? ""} className="input" aria-label="Payment method">
          <option value="">Any payment</option>
          {["UPI", "Card", "COD", "Netbanking"].map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <button className="btn-primary" type="submit">
          Filter
        </button>
      </form>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-line">
            <tr>
              <th className="th">Order</th>
              <th className="th">Date (IST)</th>
              <th className="th">Customer</th>
              <th className="th">Items</th>
              <th className="th">Payment</th>
              <th className="th">Status</th>
              <th className="th text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((o) => (
              <tr key={o.id} className="hover:bg-ink/[0.03]">
                <td className="td">
                  <Link href={`/orders/${o.id}`} className="font-semibold hover:underline">
                    #{o.id}
                  </Link>
                </td>
                <td className="td whitespace-nowrap text-xs text-muted">{dateTime(o.createdAt)}</td>
                <td className="td">
                  {o.customer.name}
                  <div className="text-xs text-muted">{o.customer.city}</div>
                </td>
                <td className="td">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {o.lines.map((l) => (
                        <Thumb key={l.sku} id={l.image} alt={l.name} className="h-9 w-7 ring-2 ring-surface" w={80} />
                      ))}
                    </div>
                    <span className="text-xs text-muted">{o.lines.reduce((s, l) => s + l.qty, 0)} item(s)</span>
                  </div>
                </td>
                <td className="td text-xs">
                  {o.payment}
                  <div className={o.paymentStatus === "paid" ? "text-emerald-600" : o.paymentStatus === "refunded" ? "text-red-600" : "text-amber-600"}>{o.paymentStatus}</div>
                </td>
                <td className="td">
                  <Pill tone={statusTone[o.status]}>{o.status}</Pill>
                </td>
                <td className="td text-right font-semibold tabular-nums">{inr(o.total)}</td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <p className="font-display text-xl uppercase tracking-wide">No orders found</p>
                  <p className="mt-1 text-sm text-muted">
                    Try another order number, customer name or status.{" "}
                    <Link href="/orders" className="font-semibold text-ink underline underline-offset-2">
                      Clear filters
                    </Link>
                  </p>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-muted">
        <span>
          {filtered.length} orders · page {page} of {pages}
        </span>
        <span className="flex gap-2">
          {page > 1 ? (
            <Link className="btn-ghost" href={href({ page: String(page - 1) })}>
              ← Prev
            </Link>
          ) : null}
          {page < pages ? (
            <Link className="btn-ghost" href={href({ page: String(page + 1) })}>
              Next →
            </Link>
          ) : null}
        </span>
      </div>
    </div>
  );
}
