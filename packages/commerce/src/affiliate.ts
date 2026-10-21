import type { Product } from "@cheshire/types";
import { createCommerceEvent, emitCommerceEvent } from "./events";

export type AffiliateNetwork = "direct" | "impact" | "cj" | "shareasale" | "custom";

export type AffiliateClickInput = {
  product: Product;
  partnerId: string;
  partnerName: string;
  destinationUrl: string;
  sessionId?: string;
  userId?: string;
  customerId?: string;
  campaign?: string;
  source?: string;
  network?: AffiliateNetwork;
};

export type AffiliateClick = {
  id: string;
  trackingId: string;
  productId: string;
  productSlug: string;
  partnerId: string;
  partnerName: string;
  sessionId?: string;
  customerId?: string;
  campaign?: string;
  source?: string;
  network: AffiliateNetwork;
  destinationUrl: string;
  createdAt: string;
  converted?: boolean;
  estimatedCommission?: number;
};

export type AffiliateClickRecord = AffiliateClickInput & {
  id: string;
  trackingId: string;
  productId: string;
  createdAt: string;
};

export type AffiliateConversion = {
  id: string;
  clickId: string;
  trackingId: string;
  productId: string;
  partnerId: string;
  orderRef?: string;
  amount: number;
  commission: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

const clicks: AffiliateClick[] = [];
const conversions: AffiliateConversion[] = [];

export function createTrackingId() {
  const rand = Math.random().toString(36).slice(2, 10);
  return `aff_${Date.now().toString(36)}_${rand}`;
}

export function appendTrackingParams(
  destinationUrl: string,
  trackingId: string,
  trackingParam = "cheshire_tid"
) {
  try {
    const url = new URL(destinationUrl);
    url.searchParams.set(trackingParam, trackingId);
    url.searchParams.set("utm_source", "cheshire");
    url.searchParams.set("utm_medium", "affiliate");
    return url.toString();
  } catch {
    const join = destinationUrl.includes("?") ? "&" : "?";
    return `${destinationUrl}${join}${trackingParam}=${encodeURIComponent(trackingId)}`;
  }
}

export const appendAffiliateParams = appendTrackingParams;

export function recordAffiliateClick(input: AffiliateClickInput): AffiliateClickRecord {
  const trackingId = createTrackingId();
  const destinationUrl = appendTrackingParams(input.destinationUrl, trackingId);
  const record: AffiliateClickRecord = {
    ...input,
    id: trackingId,
    trackingId,
    productId: input.product.id,
    destinationUrl,
    createdAt: new Date().toISOString(),
  };
  clicks.unshift({
    id: record.id,
    trackingId,
    productId: input.product.id,
    productSlug: input.product.slug,
    partnerId: input.partnerId,
    partnerName: input.partnerName,
    sessionId: input.sessionId,
    customerId: input.customerId || input.userId,
    campaign: input.campaign,
    source: input.source,
    network: input.network ?? "direct",
    destinationUrl,
    createdAt: record.createdAt,
  });
  if (clicks.length > 2000) clicks.pop();
  void emitCommerceEvent(
    createCommerceEvent("affiliate_click", {
      trackingId,
      productId: input.product.id,
      partnerId: input.partnerId,
    })
  );
  return record;
}

export async function recordAffiliateConversion(
  input: Omit<AffiliateConversion, "id" | "createdAt">
): Promise<AffiliateConversion> {
  const conversion: AffiliateConversion = {
    ...input,
    id: `cnv_${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  };
  conversions.unshift(conversion);
  const click = clicks.find((c) => c.id === input.clickId || c.trackingId === input.trackingId);
  if (click) click.converted = true;
  await emitCommerceEvent(
    createCommerceEvent("affiliate_conversion", {
      trackingId: input.trackingId,
      commission: input.commission,
    })
  );
  return conversion;
}

export function listAffiliateClicks(limit = 100): AffiliateClick[] {
  return clicks.slice(0, limit);
}

export function listAffiliateConversions(limit = 100): AffiliateConversion[] {
  return conversions.slice(0, limit);
}

export function estimateAffiliateCommission(price: number, percent: number) {
  return Math.round((price * percent) / 100);
}

export function affiliateSummary(seedClicks: AffiliateClick[] = [], seedConversions: AffiliateConversion[] = []) {
  const allClicks = [...seedClicks, ...clicks];
  const allConversions = [...seedConversions, ...conversions];
  const clickCount = allClicks.length;
  const conversionCount = allConversions.length;
  const commission = allConversions.reduce((s, c) => s + c.commission, 0);
  const conversionRate = clickCount ? (conversionCount / clickCount) * 100 : 0;

  const byProduct = new Map<string, { productId: string; clicks: number; commission: number }>();
  for (const click of allClicks) {
    const row = byProduct.get(click.productId) ?? { productId: click.productId, clicks: 0, commission: 0 };
    row.clicks += 1;
    byProduct.set(click.productId, row);
  }
  for (const conversion of allConversions) {
    const row = byProduct.get(conversion.productId) ?? {
      productId: conversion.productId,
      clicks: 0,
      commission: 0,
    };
    row.commission += conversion.commission;
    byProduct.set(conversion.productId, row);
  }

  const byPartner = new Map<string, { partnerId: string; clicks: number; commission: number }>();
  for (const click of allClicks) {
    const row = byPartner.get(click.partnerId) ?? { partnerId: click.partnerId, clicks: 0, commission: 0 };
    row.clicks += 1;
    byPartner.set(click.partnerId, row);
  }
  for (const conversion of allConversions) {
    const row = byPartner.get(conversion.partnerId) ?? {
      partnerId: conversion.partnerId,
      clicks: 0,
      commission: 0,
    };
    row.commission += conversion.commission;
    byPartner.set(conversion.partnerId, row);
  }

  return {
    clicks: clickCount,
    conversions: conversionCount,
    conversionRate,
    commission,
    revenue: commission,
    topProducts: [...byProduct.values()].sort((a, b) => b.clicks - a.clicks).slice(0, 8),
    topPartners: [...byPartner.values()].sort((a, b) => b.commission - a.commission).slice(0, 8),
  };
}
