import { readStore, writeStore } from "./store";

export type StoreSettings = {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  lowStockThreshold: number;
  gstPercent: number;
  codEnabled: boolean;
  announcement: string;
};

export const defaultSettings: StoreSettings = {
  storeName: "CHESHIRE",
  supportEmail: "care@cheshire.com",
  supportPhone: "+91 90000 00000",
  freeShippingThreshold: 1999,
  standardShippingFee: 99,
  lowStockThreshold: 10,
  gstPercent: 12,
  codEnabled: true,
  announcement: "Free shipping over ₹1,999 · Easy 7-day returns",
};

export function getSettings(): StoreSettings {
  return { ...defaultSettings, ...readStore<Partial<StoreSettings>>("settings", {}) };
}

export function saveSettings(s: StoreSettings) {
  writeStore("settings", s);
}
