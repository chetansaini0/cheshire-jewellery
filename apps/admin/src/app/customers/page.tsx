import Link from "next/link";
import { Icon } from "@/components/Icon";
import { DemoTag, Kpi, PageHeader, Pill } from "@/components/ui";
import { compactInr, dateOnly, inr, num } from "@/lib/format";
import { listCustomers, listOrders } from "@/lib/orders";
import { categoryName } from "@/lib/products";

export const metadata = { title: "Customers" };

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; segment?: string }> }) {
  const sp = await searchParams;
  const orders = listOrders();
  const all = listCustomers(orders);
  const q = (sp.q ?? "").trim().toLowerCase();
  const rows = all
    .filter((c) => !sp.segment || c.segment === sp.segment)
    .filter((c) => !q || `${c.name} ${c.email} ${c.city} ${c.state}`.toLowerCase().includes(q));
  const ltv = all.reduce((s, c) => s + c.spent, 0) / Math.max(1, all.length);
  const repeat = all.filter((c) => c.orders > 1).length;

  return (
    <div>
      <PageHeader eyebrow="Sales" title="Customers" subtitle="Built from the demo orders. Connect auth/orders to the database to see real shoppers." actions={<DemoTag />} />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Customers" value={num(all.length)} tag={<DemoTag />} />
        <Kpi label="Repeat rate" value={`${Math.round((repeat / Math.max(1, all.length)) * 100)}%`} hint={`${repeat} ordered 2+ times`} tag={<DemoTag />} />
        <Kpi label="Avg lifetime value" value={compactInr(ltv)} tag={<DemoTag />} />
        <Kpi label="VIPs" value={num(all.filter((c) => c.segment === "VIP").length)} hint="₹60K+ spent" tag={<DemoTag />} />
      </div>
      <form className="card mb-4 grid gap-3 p-3 sm:grid-cols-[1fr_180px_auto]" action="/customers">
        <div className="relative">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={sp.q} placeholder="Name, email, city…" className="input pl-9" aria-label="Search customers" />
        </div>
        <select name="segment" defaultValue={sp.segment ?? ""} className="input" aria-label="Segment">
          <option value="">All segments</option>
          <option value="VIP">VIP</option>
          <option value="Repeat">Repeat</option>
          <option value="New">New</option>
        </select>
        <button className="btn-primary">Filter</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-line">
            <tr>
              <th className="th">Customer</th>
              <th className="th">Location</th>
              <th className="th">Segment</th>
              <th className="th">Loves</th>
              <th className="th text-right">Orders</th>
              <th className="th text-right">Spent</th>
              <th className="th">Last order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((c) => {
              const last = orders.find((o) => o.customer.id === c.id);
              return (
                <tr key={c.id} className="hover:bg-ink/[0.03]">
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-xs font-bold text-bg">
                        {c.name
                          .split(" ")
                          .map((x) => x[0])
                          .join("")}
                      </span>
                      <span>
                        <span className="block font-semibold">{c.name}</span>
                        <span className="block text-xs text-muted">{c.email}</span>
                      </span>
                    </div>
                  </td>
                  <td className="td text-xs">
                    {c.city}
                    <div className="text-muted">{c.state}</div>
                  </td>
                  <td className="td">
                    <Pill tone={c.segment === "VIP" ? "gold" : c.segment === "Repeat" ? "blue" : "gray"}>{c.segment}</Pill>
                  </td>
                  <td className="td text-xs">{categoryName(c.favouriteCategory)}</td>
                  <td className="td text-right tabular-nums">{c.orders}</td>
                  <td className="td text-right font-semibold tabular-nums">{inr(c.spent)}</td>
                  <td className="td text-xs">
                    {last ? (
                      <Link href={`/orders/${last.id}`} className="hover:underline">
                        #{last.id}
                      </Link>
                    ) : null}
                    <div className="text-muted">{dateOnly(c.lastOrder)}</div>
                  </td>
                </tr>
              );
            })}
            {!rows.length ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <p className="font-display text-xl uppercase tracking-wide">No customers found</p>
                  <p className="mt-1 text-sm text-muted">
                    Try a different name, email or city. <Link href="/customers" className="font-semibold text-ink underline underline-offset-2">Clear filters</Link>
                  </p>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
