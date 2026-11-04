import { categories } from "@cheshire/database/catalog";
import { listOrders, type Order } from "./orders";
import { listProducts, totalStock, type AdminProduct } from "./products";
import { getSettings } from "./settings";

const DAY = 86_400_000;
const counts = (o: Order) => o.status !== "cancelled";

function istDayKey(iso: string | number) {
  return new Date(new Date(iso).getTime() + 5.5 * 3600_000).toISOString().slice(0, 10);
}

/** Demo sessions so conversion can be shown; replace with real analytics events. */
function demoSessions(dayIndex: number) {
  return 150 + Math.round(38 * Math.sin(dayIndex / 3.1) + 26 * Math.cos(dayIndex / 7.3)) + dayIndex;
}

export function dashboardData(rangeDays = 30) {
  const orders = listOrders();
  const products = listProducts();
  const settings = getSettings();
  const now = Date.now();
  const inRange = (o: Order, from: number, to: number) => {
    const t = new Date(o.createdAt).getTime();
    return t >= from && t < to;
  };
  const cur = orders.filter((o) => counts(o) && inRange(o, now - rangeDays * DAY, now + 1));
  const prev = orders.filter((o) => counts(o) && inRange(o, now - 2 * rangeDays * DAY, now - rangeDays * DAY));
  const sum = (list: Order[]) => list.reduce((s, o) => s + (o.status === "returned" ? 0 : o.total), 0);
  const revenue = sum(cur);
  const prevRevenue = sum(prev);
  const aov = cur.length ? revenue / cur.length : 0;
  const prevAov = prev.length ? prevRevenue / prev.length : 0;

  let sessions = 0;
  let prevSessions = 0;
  for (let i = 0; i < rangeDays; i++) {
    sessions += demoSessions(60 - i);
    prevSessions += demoSessions(60 - rangeDays - i);
  }
  const conversion = sessions ? (cur.length / sessions) * 100 : 0;
  const prevConversion = prevSessions ? (prev.length / prevSessions) * 100 : 0;
  const pct = (a: number, b: number) => (b ? ((a - b) / b) * 100 : 0);

  // Daily trend
  const trend: Array<{ key: string; label: string; revenue: number; orders: number }> = [];
  for (let i = rangeDays - 1; i >= 0; i--) {
    const key = istDayKey(now - i * DAY);
    const d = new Date(`${key}T00:00:00Z`);
    trend.push({ key, label: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", timeZone: "UTC" }), revenue: 0, orders: 0 });
  }
  const idx = new Map(trend.map((t, i) => [t.key, i]));
  for (const o of cur) {
    const i = idx.get(istDayKey(o.createdAt));
    if (i === undefined) continue;
    trend[i].revenue += o.status === "returned" ? 0 : o.total;
    trend[i].orders += 1;
  }

  // Sales by category (demo orders)
  const salesByCat = new Map<string, number>();
  const unitsBySku = new Map<string, { units: number; revenue: number }>();
  for (const o of cur) {
    if (o.status === "returned") continue;
    for (const l of o.lines) {
      salesByCat.set(l.category, (salesByCat.get(l.category) ?? 0) + l.price * l.qty);
      const u = unitsBySku.get(l.sku) ?? { units: 0, revenue: 0 };
      u.units += l.qty;
      u.revenue += l.price * l.qty;
      unitsBySku.set(l.sku, u);
    }
  }
  const salesMix = categories
    .map((c) => ({ slug: c.slug, name: c.name, value: salesByCat.get(c.slug) ?? 0 }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);

  // Catalogue mix (real)
  const catalogueMix = categories
    .map((c) => {
      const list = products.filter((p) => p.category === c.slug);
      return {
        slug: c.slug,
        name: c.name,
        skus: list.length,
        units: list.reduce((s, p) => s + totalStock(p), 0),
        stockValue: list.reduce((s, p) => s + totalStock(p) * p.price, 0),
      };
    })
    .filter((c) => c.skus > 0)
    .sort((a, b) => b.stockValue - a.stockValue);

  const bySku = new Map(products.map((p) => [p.sku, p]));
  const topProducts = [...unitsBySku.entries()]
    .map(([sku, v]) => ({ sku, ...v, product: bySku.get(sku) }))
    .filter((x): x is typeof x & { product: AdminProduct } => Boolean(x.product))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  const lowStock = lowStockRows(products, settings.lowStockThreshold);

  return {
    rangeDays,
    settings,
    kpis: {
      revenue,
      revenueDelta: pct(revenue, prevRevenue),
      orders: cur.length,
      ordersDelta: pct(cur.length, prev.length),
      aov,
      aovDelta: pct(aov, prevAov),
      conversion,
      conversionDelta: pct(conversion, prevConversion),
      sessions,
      lowStock: lowStock.length,
      outOfStock: products.filter((p) => p.status === "active" && totalStock(p) === 0).length,
      toFulfil: orders.filter((o) => ["placed", "confirmed", "packed"].includes(o.status)).length,
      activeProducts: products.filter((p) => p.status === "active").length,
      draftProducts: products.filter((p) => p.status === "draft").length,
    },
    trend,
    salesMix,
    catalogueMix,
    topProducts,
    lowStock: lowStock.slice(0, 8),
    recentOrders: orders.slice(0, 8),
  };
}

export function lowStockRows(products: AdminProduct[], threshold: number) {
  return products
    .filter((p) => p.status === "active")
    .map((p) => {
      const low = Object.entries(p.stockBySize).filter(([, n]) => n <= Math.max(1, Math.round(threshold / 3)));
      return { product: p, total: totalStock(p), lowSizes: low.map(([s, n]) => `${s}:${n}`) };
    })
    .filter((r) => r.total <= threshold || r.lowSizes.length > 0)
    .sort((a, b) => a.total - b.total);
}
