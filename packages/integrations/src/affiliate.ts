import { appendTrackingParams, createTrackingId } from "@cheshire/commerce";

export type AffiliateLinkInput = {
  destinationUrl: string;
  trackingParam?: string;
  campaign?: string;
};

export function generateTrackingLink(input: AffiliateLinkInput) {
  const trackingId = createTrackingId();
  return { trackingId, url: appendTrackingParams(input.destinationUrl, trackingId, input.trackingParam) };
}

export type AffiliateClickEvent = {
  trackingId: string;
  partnerId: string;
  productId: string;
  createdAt: string;
};

export type AffiliateConversionEvent = {
  trackingId: string;
  orderValue?: number;
  commission?: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};
