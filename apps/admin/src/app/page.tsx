import Link from "next/link";
import { BarList, Donut, TrendChart } from "@/components/charts";
import { Icon } from "@/components/Icon";
import { Thumb } from "@/components/Thumb";
import { DemoTag, Kpi, LiveTag, PageHeader, Panel, Pill } from "@/components/ui";
import { compactInr, dateTime, inr, num } from "@/lib/format";
import { dashboardData } from "@/lib/metrics";
import { statusTone } from "@/lib/orders";
import { categoryName } from "@/lib/products";
import { GettingStarted, type ChecklistItem } from "@/components/GettingStarted";
import { readAllHeroBanners } from "@cheshire/config/banner-store";
import { listWebhooks } from "@cheshire/config/automation";
import { authMode } from "@/lib/auth";
import { storeFileExists } from "@/lib/store";

export const metadata = { title: "Dashboard" };

const RANGES = [7, 30, 60] as const;

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const { range } = await searchParams;
  const days = RANGES.find((r) => String(r) === range) ?? 30;
  const d = dashboardData(days);
  const ethnic = d.salesMix.filter((c) => ["lehengas", "sarees", "suits"].includes(c.slug)).reduce((s, c) => s + c.value, 0);
  const totalSales = d.salesMix.reduce((s, c) => s + c.value, 0) || 1;
  const checklist: ChecklistItem[] = [
    { id: "password", title: "Protect your admin", detail: "Set ADMIN_PASSWORD so only you can sign in.", href: "/settings", done: authMode() === "on" },
    { id: "products", title: "Review your products", detail: "Check prices, photos and stock per size.", href: "/products", done: storeFileExists("products") },
    { id: "banners", title: "Update homepage banners", detail: "Up to 5 slides in the homepage carousel.", href: "/banners", done: readAllHeroBanners().source === "file" },
    { id: "settings", title: "Fill in store settings", detail: "Support contact, delivery charges, low-stock alert level.", href: "/settings", done: storeFileExists("settings") },
    { id: "coupon", title: "Create a discount code", detail: "e.g. WELCOME10 for first orders.", href: "/coupons", done: storeFileExists("coupons") },
    { id: "automation", title: "Connect an automation", detail: "Send low-stock or order alerts to Zapier, Make or n8n.", href: "/automations", done: listWebhooks().length > 0 },
  ];

  return (
    <div>
      <PageHeader
        eyebrow={new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" })}
        title="Dashboard"
        subtitle={
          <>
            Sales, orders and conversion below are <strong>demo data</strong> generated from the real catalogue (there is no order database yet).
            Stock, low-stock alerts and catalogue mix are live from the catalogue and your admin edits.
          </>
        }
        actions={
          <div className="flex rounded-md border border-line bg-surface p-0.5">
            {RANGES.map((r) => (
              <Link
                key={r}
                href={`/?range=${r}`}
                className={`rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] ${r === days ? "bg-ink text-bg" : "text-muted hover:text-ink"}`}
              >
                {r}d
              </Link>
            ))}
          </div>
        }
      />

      <GettingStarted items={checklist} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
        <Kpi label="Revenue" value={compactInr(d.kpis.revenue)} delta={d.kpis.revenueDelta} hint={`vs prev ${days}d`} tag={<DemoTag />} tone="gold" />
        <Kpi label="Orders" value={num(d.kpis.orders)} delta={d.kpis.ordersDelta} hint={`${d.kpis.toFulfil} to fulfil`} tag={<DemoTag />} href="/orders" />
        <Kpi label="Avg order value" value={inr(d.kpis.aov)} delta={d.kpis.aovDelta} hint="excl. cancelled" tag={<DemoTag />} />
        <Kpi
          label="Conversion"
          value={`${d.kpis.conversion.toFixed(2)}%`}
          delta={d.kpis.conversionDelta}
          hint={`${num(d.kpis.sessions)} sessions`}
          tag={<DemoTag />}
        />
        <Kpi
          label="Low stock"
          value={num(d.kpis.lowStock)}
          hint={`${d.kpis.outOfStock} sold out · ≤${d.settings.lowStockThreshold} units`}
          tag={<LiveTag />}
          tone={d.kpis.lowStock ? "warn" : "default"}
          href="/inventory?filter=low"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Sales trend"
          tag={<DemoTag />}
          action={<span className="text-xs text-muted">Revenue line · orders bars · last {days} days</span>}
        >
          <TrendChart data={d.trend} />
        </Panel>
        <Panel title="Sales by category" tag={<DemoTag />}>
          <Donut data={d.salesMix.map((c) => ({ name: c.name, value: c.value }))} centerLabel="Ethnic share" centerValue={`${Math.round((ethnic / totalSales) * 100)}%`} />
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Recent orders"
          tag={<DemoTag />}
          action={
            <Link href="/orders" className="text-xs font-semibold uppercase tracking-[0.12em] text-gold-deep hover:underline">
              All orders →
            </Link>
          }
          bodyClassName="overflow-x-auto"
        >
          <table className="min-w-full text-sm">
            <thead className="border-b border-line">
              <tr>
                <th className="th">Order</th>
                <th className="th">Customer</th>
                <th className="th">Items</th>
                <th className="th">Status</th>
                <th className="th text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {d.recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-ink/[0.03]">
                  <td className="td">
                    <Link href={`/orders/${o.id}`} className="font-semibold hover:underline">
                      #{o.id}
                    </Link>
                    <div className="text-xs text-muted">{dateTime(o.createdAt)}</div>
                  </td>
                  <td className="td">
                    {o.customer.name}
                    <div className="text-xs text-muted">{o.customer.city}</div>
                  </td>
                  <td className="td">
                    <div className="flex -space-x-2">
                      {o.lines.map((l) => (
                        <Thumb key={l.sku} id={l.image} alt={l.name} className="h-9 w-7 ring-2 ring-surface" w={80} />
                      ))}
                    </div>
                  </td>
                  <td className="td">
                    <Pill tone={statusTone[o.status]}>{o.status}</Pill>
                  </td>
                  <td className="td text-right font-semibold tabular-nums">{inr(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel
          title="Low-stock alerts"
          tag={<LiveTag />}
          action={
            <Link href="/inventory?filter=low" className="text-xs font-semibold uppercase tracking-[0.12em] text-gold-deep hover:underline">
              Inventory →
            </Link>
          }
          bodyClassName="divide-y divide-line"
        >
          {d.lowStock.length ? (
            d.lowStock.map((r) => (
              <Link key={r.product.sku} href={`/products/${r.product.sku}`} className="flex items-center gap-3 px-5 py-3 hover:bg-ink/[0.03]">
                <Thumb id={r.product.images[0]} alt={r.product.name} className="h-11 w-9" w={80} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.product.name}</p>
                  <p className="truncate text-xs text-muted">
                    {r.product.sku} · low: {r.lowSizes.join(", ") || "—"}
                  </p>
                </div>
                <Pill tone={r.total === 0 ? "red" : "amber"}>{r.total === 0 ? "Sold out" : `${r.total} left`}</Pill>
              </Link>
            ))
          ) : (
            <p className="px-5 py-6 text-sm text-muted">Everything is above the threshold.</p>
          )}
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Top products" tag={<DemoTag />} bodyClassName="divide-y divide-line">
          {d.topProducts.map((t, i) => (
            <Link key={t.sku} href={`/products/${t.sku}`} className="flex items-center gap-3 px-5 py-3 hover:bg-ink/[0.03]">
              <span className="w-5 font-display text-lg text-muted">{i + 1}</span>
              <Thumb id={t.product.images[0]} alt={t.product.name} className="h-11 w-9" w={80} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{t.product.name}</p>
                <p className="text-xs text-muted">
                  {categoryName(t.product.category)} · {t.units} sold
                </p>
              </div>
              <span className="text-sm font-semibold tabular-nums">{compactInr(t.revenue)}</span>
            </Link>
          ))}
        </Panel>
        <Panel title="Catalogue mix" tag={<LiveTag />} action={<span className="text-xs text-muted">Stock value at selling price</span>}>
          <BarList
            rows={d.catalogueMix.map((c) => ({
              label: c.name,
              sub: `${c.skus} SKUs · ${num(c.units)} units`,
              value: c.stockValue,
              display: compactInr(c.stockValue),
              highlight: ["lehengas", "sarees", "suits"].includes(c.slug),
            }))}
          />
          <p className="mt-4 flex items-center gap-2 text-xs text-muted">
            <span className="h-2 w-4 rounded-full bg-gold" /> Festive Edit categories (lehengas, sarees, suits)
          </p>
        </Panel>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { href: "/products/new", label: "Add product", icon: "plus" as const },
          { href: "/banners", label: "Edit hero banners", icon: "image" as const },
          { href: "/orders?status=placed", label: "Confirm new orders", icon: "cart" as const },
          { href: "/coupons", label: "Create a coupon", icon: "percent" as const },
        ].map((a) => (
          <Link key={a.href} href={a.href} className="card flex items-center gap-3 p-4 text-sm font-semibold uppercase tracking-[0.1em] hover:border-ink">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-gold text-white">
              <Icon name={a.icon} />
            </span>
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
