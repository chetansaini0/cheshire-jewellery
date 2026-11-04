import { readStore, writeStore } from "./store";

export type CouponType = "percent" | "flat" | "free_shipping";

export type Coupon = {
  code: string;
  description: string;
  type: CouponType;
  value: number;
  minSubtotal: number;
  /** empty = all categories */
  categories: string[];
  usageLimit: number;
  /** Demo usage count until checkout is wired to this store */
  used: number;
  startsAt: string;
  endsAt: string;
  active: boolean;
};

const seed: Coupon[] = [
  {
    code: "WELCOME10",
    description: "10% off the first order",
    type: "percent",
    value: 10,
    minSubtotal: 999,
    categories: [],
    usageLimit: 1000,
    used: 214,
    startsAt: "2026-09-01",
    endsAt: "2026-12-31",
    active: true,
  },
  {
    code: "SHAADI15",
    description: "15% off the Festive Edit",
    type: "percent",
    value: 15,
    minSubtotal: 4999,
    categories: ["lehengas", "sarees", "suits"],
    usageLimit: 500,
    used: 63,
    startsAt: "2026-10-15",
    endsAt: "2026-12-15",
    active: true,
  },
  {
    code: "FLAT500",
    description: "₹500 off orders above ₹2,999",
    type: "flat",
    value: 500,
    minSubtotal: 2999,
    categories: [],
    usageLimit: 300,
    used: 300,
    startsAt: "2026-08-01",
    endsAt: "2026-10-31",
    active: false,
  },
  {
    code: "SHIPFREE",
    description: "Free shipping, any order",
    type: "free_shipping",
    value: 0,
    minSubtotal: 0,
    categories: [],
    usageLimit: 0,
    used: 41,
    startsAt: "2026-10-01",
    endsAt: "2026-11-30",
    active: true,
  },
];

type CouponStore = { coupons: Coupon[] };

export function listCoupons(): Coupon[] {
  return readStore<CouponStore>("coupons", { coupons: seed }).coupons;
}

export function couponState(c: Coupon, now = new Date()): "active" | "scheduled" | "expired" | "paused" | "used up" {
  if (!c.active) return "paused";
  if (c.usageLimit > 0 && c.used >= c.usageLimit) return "used up";
  const today = now.toISOString().slice(0, 10);
  if (c.startsAt > today) return "scheduled";
  if (c.endsAt && c.endsAt < today) return "expired";
  return "active";
}

export function validateCoupon(c: Coupon, opts: { isNew: boolean }) {
  const errors: Record<string, string> = {};
  if (!/^[A-Z0-9]{3,20}$/.test(c.code)) errors.code = "3–20 uppercase letters or numbers";
  else if (opts.isNew && listCoupons().some((x) => x.code === c.code)) errors.code = "Code already exists";
  if (c.type === "percent" && (c.value <= 0 || c.value > 90)) errors.value = "Percent must be 1–90";
  if (c.type === "flat" && c.value <= 0) errors.value = "Amount must be above 0";
  if (c.minSubtotal < 0) errors.minSubtotal = "Must be ≥ 0";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(c.startsAt)) errors.startsAt = "Start date required";
  if (c.endsAt && c.endsAt < c.startsAt) errors.endsAt = "End must be after start";
  return errors;
}

export function saveCoupon(c: Coupon, originalCode?: string) {
  const list = listCoupons().filter((x) => x.code !== (originalCode ?? c.code) && x.code !== c.code);
  writeStore("coupons", { coupons: [c, ...list] });
}

export function toggleCoupon(code: string) {
  const list = listCoupons().map((c) => (c.code === code ? { ...c, active: !c.active } : c));
  writeStore("coupons", { coupons: list });
}
