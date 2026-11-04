import { seedProducts } from "@cheshire/database/catalog";
import { readStore, writeStore } from "./store";

/**
 * DEMO ORDERS. The project has no order database yet (checkout only creates in-memory supplier orders),
 * so the admin generates a deterministic set of orders from the real catalogue (real SKUs, sizes, prices).
 * Status changes made in the admin are persisted to `.data/admin/orders.json` and layered on top.
 */
export const ORDER_STATUSES = ["placed", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderEvent = { status: OrderStatus; at: string; note?: string; by?: string };
export type OrderLine = { sku: string; name: string; size: string; qty: number; price: number; image: string; category: string };
export type Order = {
  id: string;
  createdAt: string;
  customer: { id: string; name: string; email: string; phone: string; city: string; state: string; pincode: string };
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shipping: number;
  total: number;
  payment: "UPI" | "Card" | "COD" | "Netbanking";
  paymentStatus: "paid" | "pending" | "refunded";
  status: OrderStatus;
  events: OrderEvent[];
  awb?: string;
};

const PEOPLE: Array<[string, string, string, string]> = [
  ["Aarohi Mehta", "Mumbai", "Maharashtra", "400050"],
  ["Kabir Malhotra", "New Delhi", "Delhi", "110024"],
  ["Ishita Rao", "Bengaluru", "Karnataka", "560038"],
  ["Vihaan Kapoor", "Gurugram", "Haryana", "122002"],
  ["Ananya Iyer", "Chennai", "Tamil Nadu", "600017"],
  ["Rohan Desai", "Pune", "Maharashtra", "411001"],
  ["Meera Nair", "Kochi", "Kerala", "682020"],
  ["Arjun Singh", "Jaipur", "Rajasthan", "302001"],
  ["Saanvi Gupta", "Lucknow", "Uttar Pradesh", "226010"],
  ["Aditya Verma", "Hyderabad", "Telangana", "500033"],
  ["Diya Banerjee", "Kolkata", "West Bengal", "700019"],
  ["Reyansh Joshi", "Ahmedabad", "Gujarat", "380009"],
  ["Kiara Sethi", "Chandigarh", "Chandigarh", "160017"],
  ["Ayaan Khan", "Bhopal", "Madhya Pradesh", "462016"],
  ["Myra Chawla", "Ludhiana", "Punjab", "141001"],
  ["Vivaan Reddy", "Visakhapatnam", "Andhra Pradesh", "530017"],
  ["Navya Pillai", "Thiruvananthapuram", "Kerala", "695014"],
  ["Shaurya Bhatia", "Noida", "Uttar Pradesh", "201301"],
  ["Tara Saxena", "Indore", "Madhya Pradesh", "452001"],
  ["Advik Shetty", "Mangaluru", "Karnataka", "575001"],
  ["Riya Agarwal", "Surat", "Gujarat", "395007"],
  ["Krish Menon", "Coimbatore", "Tamil Nadu", "641002"],
  ["Pari Thakur", "Dehradun", "Uttarakhand", "248001"],
  ["Neel Chatterjee", "Guwahati", "Assam", "781005"],
];

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DAY = 86_400_000;
const FLOW: OrderStatus[] = ["placed", "confirmed", "packed", "shipped", "delivered"];
export const STATUS_NOTES: Record<OrderStatus, string> = {
  placed: "Order placed on cheshire.com",
  confirmed: "Payment verified, order confirmed",
  packed: "Packed at Mumbai warehouse",
  shipped: "Handed to Delhivery",
  delivered: "Delivered to customer",
  cancelled: "Cancelled",
  returned: "Return received and refunded",
};

/** Midnight IST today, so the demo set is stable for a day and always looks current. */
function anchor() {
  const now = Date.now();
  const ist = now + 5.5 * 3600_000;
  return now - (ist % DAY) + DAY;
}

function generate(): Order[] {
  const end = anchor();
  const orders: Order[] = [];
  const pool = seedProducts.filter((p) => p.stock > 0);
  const COUNT = 210;
  for (let i = 0; i < COUNT; i++) {
    // Each order has its own seeded RNG so content never shifts as the clock moves.
    const r = rng(20261102 + i * 9973);
    // more orders recently, festive skew
    const daysAgo = Math.floor(Math.pow(r(), 1.25) * 60);
    const created = end - daysAgo * DAY - Math.floor((0.15 + r() * 0.8) * DAY);
    const pi = Math.floor(r() * PEOPLE.length);
    const [name, city, state, pincode] = PEOPLE[pi];
    const nLines = r() < 0.68 ? 1 : r() < 0.8 ? 2 : 3;
    const lines: OrderLine[] = [];
    for (let l = 0; l < nLines; l++) {
      // ethnic wear sells better in Oct–Nov
      const ethnic = r() < 0.3;
      const candidates = ethnic ? pool.filter((p) => ["lehengas", "sarees", "suits"].includes(p.category)) : pool;
      const p = candidates[Math.floor(r() * candidates.length)];
      if (lines.some((x) => x.sku === p.sku)) continue;
      const size = p.sizes.length ? p.sizes[Math.floor(r() * p.sizes.length)] : "One Size";
      lines.push({ sku: p.sku, name: p.name, size, qty: r() < 0.85 ? 1 : 2, price: p.price, image: p.imageIds[0], category: p.category });
    }
    const subtotal = lines.reduce((s, x) => s + x.price * x.qty, 0);
    const couponRoll = r();
    const couponCode = couponRoll < 0.12 ? "WELCOME10" : couponRoll < 0.2 && lines.some((x) => ["lehengas", "sarees", "suits"].includes(x.category)) ? "SHAADI15" : undefined;
    const discount = couponCode === "WELCOME10" ? Math.round(subtotal * 0.1) : couponCode === "SHAADI15" ? Math.round(subtotal * 0.15) : 0;
    const shipping = subtotal - discount >= 1999 ? 0 : 99;
    const payRoll = r();
    const payment: Order["payment"] = payRoll < 0.52 ? "UPI" : payRoll < 0.78 ? "Card" : payRoll < 0.93 ? "COD" : "Netbanking";
    // status by age
    const ageDays = (Date.now() - created) / DAY;
    const special = r();
    let status: OrderStatus;
    if (special < 0.04) status = "cancelled";
    else if (special < 0.08 && ageDays > 10) status = "returned";
    else if (ageDays > 7) status = "delivered";
    else if (ageDays > 4) status = r() < 0.6 ? "delivered" : "shipped";
    else if (ageDays > 2) status = r() < 0.5 ? "shipped" : "packed";
    else if (ageDays > 0.6) status = r() < 0.5 ? "packed" : "confirmed";
    else status = r() < 0.5 ? "confirmed" : "placed";

    const events: OrderEvent[] = [];
    let t = created;
    const target = status === "cancelled" ? "confirmed" : status === "returned" ? "delivered" : status;
    for (const s of FLOW) {
      events.push({ status: s, at: new Date(t).toISOString(), note: STATUS_NOTES[s], by: s === "placed" ? "Customer" : "System" });
      if (s === target) break;
      t += Math.floor((0.2 + r() * (s === "shipped" ? 2.5 : 0.9)) * DAY);
      if (t > Date.now()) t = Date.now() - 60_000;
    }
    if (status === "cancelled" || status === "returned") {
      t += Math.floor((0.2 + r()) * DAY * (status === "returned" ? 4 : 0.4));
      events.push({
        status,
        at: new Date(Math.min(t, Date.now() - 60_000)).toISOString(),
        note: status === "returned" ? "Size exchange not available — refunded" : "Cancelled by customer before packing",
        by: "Support",
      });
    }
    const paymentStatus: Order["paymentStatus"] =
      status === "returned" || (status === "cancelled" && payment !== "COD") ? "refunded" : payment === "COD" && status !== "delivered" ? "pending" : "paid";
    orders.push({
      id: "",
      createdAt: new Date(created).toISOString(),
      customer: {
        id: `cus_${pi + 1}`,
        name,
        email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
        phone: `+91 98${String(100000 + pi * 7919).slice(0, 3)} ${String(10000 + pi * 3571).slice(0, 5)}`,
        city,
        state,
        pincode,
      },
      lines,
      subtotal,
      discount,
      couponCode,
      shipping,
      total: subtotal - discount + shipping,
      payment,
      paymentStatus,
      status,
      events,
      awb: ["shipped", "delivered", "returned"].includes(status) ? `DLV${String(7300000000 + i * 7919)}` : undefined,
    });
  }
  // Number chronologically (stable: relative order never changes), then drop anything still in the future today.
  return orders
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((o, i) => ({ ...o, id: `CH${10400 + i}` }))
    .filter((o) => new Date(o.createdAt).getTime() <= Date.now())
    .reverse();
}

type OrderOverrides = Record<string, { status: OrderStatus; events: OrderEvent[]; awb?: string }>;

let cache: { key: number; orders: Order[] } | null = null;

export function listOrders(): Order[] {
  const key = anchor();
  if (!cache || cache.key !== key) cache = { key, orders: generate() };
  const overrides = readStore<OrderOverrides>("orders", {});
  return cache.orders.map((o) => {
    const ov = overrides[o.id];
    if (!ov) return o;
    return {
      ...o,
      status: ov.status,
      events: [...o.events, ...ov.events],
      awb: ov.awb ?? o.awb,
      paymentStatus: ov.status === "returned" || (ov.status === "cancelled" && o.payment !== "COD") ? "refunded" : ov.status === "delivered" ? "paid" : o.paymentStatus,
    };
  });
}

export function getOrder(id: string) {
  return listOrders().find((o) => o.id === id);
}

/** Allowed next statuses from the current one. */
export function nextStatuses(s: OrderStatus): OrderStatus[] {
  switch (s) {
    case "placed":
      return ["confirmed", "cancelled"];
    case "confirmed":
      return ["packed", "cancelled"];
    case "packed":
      return ["shipped", "cancelled"];
    case "shipped":
      return ["delivered"];
    case "delivered":
      return ["returned"];
    default:
      return [];
  }
}

export function updateOrderStatus(id: string, status: OrderStatus, note?: string) {
  const order = getOrder(id);
  if (!order) return { ok: false as const, error: "Order not found" };
  if (!nextStatuses(order.status).includes(status)) return { ok: false as const, error: `Can't move from ${order.status} to ${status}` };
  const overrides = readStore<OrderOverrides>("orders", {});
  const prev = overrides[id] ?? { status: order.status, events: [] };
  const awb = status === "shipped" ? order.awb ?? `DLV${Date.now().toString().slice(-10)}` : prev.awb;
  overrides[id] = {
    status,
    awb,
    events: [...prev.events, { status, at: new Date().toISOString(), note: note?.trim() || STATUS_NOTES[status], by: "Admin" }],
  };
  writeStore("orders", overrides);
  return { ok: true as const };
}

export const statusTone: Record<OrderStatus, "gray" | "blue" | "amber" | "gold" | "green" | "red"> = {
  placed: "gray",
  confirmed: "blue",
  packed: "amber",
  shipped: "gold",
  delivered: "green",
  cancelled: "red",
  returned: "red",
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  orders: number;
  spent: number;
  firstOrder: string;
  lastOrder: string;
  segment: "VIP" | "Repeat" | "New";
  favouriteCategory: string;
};

export function listCustomers(orders = listOrders()): Customer[] {
  const map = new Map<string, Customer & { cats: Record<string, number> }>();
  for (const o of [...orders].reverse()) {
    const c = map.get(o.customer.id) ?? {
      ...o.customer,
      orders: 0,
      spent: 0,
      firstOrder: o.createdAt,
      lastOrder: o.createdAt,
      segment: "New" as const,
      favouriteCategory: "",
      cats: {},
    };
    c.orders += 1;
    if (o.status !== "cancelled" && o.status !== "returned") c.spent += o.total;
    c.lastOrder = o.createdAt;
    for (const l of o.lines) c.cats[l.category] = (c.cats[l.category] ?? 0) + l.qty;
    map.set(o.customer.id, c);
  }
  return [...map.values()]
    .map(({ cats, ...c }) => ({
      ...c,
      segment: (c.spent >= 60000 ? "VIP" : c.orders >= 2 ? "Repeat" : "New") as Customer["segment"],
      favouriteCategory: Object.entries(cats).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "",
    }))
    .sort((a, b) => b.spent - a.spent);
}
