const CONFIDENTIAL_KEYS = [
  "supplierCost",
  "commissionPercentOverride",
  "affiliateUrl",
  "affiliateNetwork",
  "bankAccountNumber",
  "bankIfsc",
  "panNumber",
  "encryptedCredentials",
  "apiSecret",
  "accessToken",
] as const;

export function stripConfidential<T extends Record<string, unknown>>(input: T): T {
  const next = { ...input };
  for (const key of CONFIDENTIAL_KEYS) {
    if (key in next) delete next[key];
  }
  return next;
}

export function publicProductType(value?: string | null) {
  if (value === "affiliate" || value === "marketplace" || value === "dropship") return value;
  if (value === "AFFILIATE") return "affiliate" as const;
  if (value === "MARKETPLACE") return "marketplace" as const;
  return "dropship" as const;
}
