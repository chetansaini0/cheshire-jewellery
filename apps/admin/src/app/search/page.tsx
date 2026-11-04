import Link from "next/link";
import { Thumb } from "@/components/Thumb";
import { EmptyState, PageHeader, Panel, Pill } from "@/components/ui";
import { inr } from "@/lib/format";
import { listCustomers, listOrders, statusTone } from "@/lib/orders";
import { listProducts, totalStock } from "@/lib/products";

export const metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const needle = q.trim().toLowerCase();
  const products = needle ? listProducts().filter((p) => `${p.sku} ${p.name} ${p.fabric} ${p.colour} ${p.category} ${p.collection}`.toLowerCase().includes(needle)).slice(0, 12) : [];
  const orders = needle ? listOrders().filter((o) => `${o.id} ${o.customer.name} ${o.customer.city} ${o.lines.map((l) => l.sku).join(" ")}`.toLowerCase().includes(needle.replace(/^#/, ""))).slice(0, 8) : [];
  const customers = needle ? listCustomers().filter((c) => `${c.name} ${c.email} ${c.city}`.toLowerCase().includes(needle)).slice(0, 8) : [];
  return (
    <div>
      <PageHeader eyebrow="Search" title={q ? `“${q}”` : "Search"} subtitle={`${products.length} products · ${orders.length} orders · ${customers.length} customers`} />
      {!needle ? <EmptyState title="Type in the search bar">Find products by name, SKU, fabric or colour; orders by number or customer.</EmptyState> : null}
      {needle && !products.length && !orders.length && !customers.length ? <EmptyState title="No results">Try a SKU like CH-LEH-001 or a fabric like chanderi.</EmptyState> : null}
      <div className="grid gap-6 xl:grid-cols-2">
        {products.length ? (
          <Panel title="Products" bodyClassName="divide-y divide-line">
            {products.map((p) => (
              <Link key={p.sku} href={`/products/${p.sku}`} className="flex items-center gap-3 px-5 py-3 hover:bg-ink/[0.03]">
                <Thumb id={p.images[0]} alt={p.name} className="h-12 w-10" w={80} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{p.name}</p>
                  <p className="text-xs text-muted">
                    {p.sku} · {p.fabric} · {totalStock(p)} in stock
                  </p>
                </div>
                <span className="text-sm tabular-nums">{inr(p.price)}</span>
              </Link>
            ))}
          </Panel>
        ) : null}
        {orders.length ? (
          <Panel title="Orders" bodyClassName="divide-y divide-line">
            {orders.map((o) => (
              <Link key={o.id} href={`/orders/${o.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-ink/[0.03]">
                <span>
                  <span className="font-semibold">#{o.id}</span> <span className="text-sm text-muted">· {o.customer.name}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Pill tone={statusTone[o.status]}>{o.status}</Pill>
                  <span className="text-sm tabular-nums">{inr(o.total)}</span>
                </span>
              </Link>
            ))}
          </Panel>
        ) : null}
        {customers.length ? (
          <Panel title="Customers" bodyClassName="divide-y divide-line">
            {customers.map((c) => (
              <Link key={c.id} href={`/customers?q=${encodeURIComponent(c.email)}`} className="flex items-center justify-between px-5 py-3 hover:bg-ink/[0.03]">
                <span className="font-semibold">{c.name}</span>
                <span className="text-xs text-muted">
                  {c.city} · {c.orders} orders
                </span>
              </Link>
            ))}
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
