const recentOrderFingerprints = new Map<string, number>();

export function fingerprintOrder(input: {
  phone: string;
  pincode: string;
  total: number;
  skuKey: string;
}): string {
  return `${input.phone}:${input.pincode}:${input.total}:${input.skuKey}`;
}

export function isDuplicateOrder(fingerprint: string, windowMs = 120_000): boolean {
  const last = recentOrderFingerprints.get(fingerprint);
  const now = Date.now();
  recentOrderFingerprints.set(fingerprint, now);
  return Boolean(last && now - last < windowMs);
}

export function isSuspiciousAmount(amount: number): boolean {
  return amount <= 0 || amount > 500_000;
}

export type FraudSignal = {
  code: string;
  severity: "low" | "medium" | "high";
  message: string;
};

export function detectDuplicateOrder(params: {
  recentFingerprints: string[];
  fingerprint: string;
}): FraudSignal | null {
  if (params.recentFingerprints.includes(params.fingerprint)) {
    return {
      code: "duplicate_order",
      severity: "medium",
      message: "Possible duplicate order from the same cart and address.",
    };
  }
  return null;
}

export function orderFingerprint(input: {
  productIds: string[];
  total: number;
  pincode: string;
  phone: string;
}) {
  return `${input.productIds.slice().sort().join(",")}:${input.total}:${input.pincode}:${input.phone}`;
}

export function suspiciousPayment(params: { amount: number; failedAttempts: number }): FraudSignal | null {
  if (params.failedAttempts >= 5) {
    return {
      code: "payment_retry_burst",
      severity: "high",
      message: "Too many failed payment attempts.",
    };
  }
  if (params.amount > 250000) {
    return {
      code: "high_value_order",
      severity: "medium",
      message: "High-value order requires review.",
    };
  }
  return null;
}

export function reviewLooksFake(body: string, rating: number) {
  const short = body.trim().length < 12;
  const generic = /^(good|nice|best|amazing|love it)[.! ]*$/i.test(body.trim());
  return (short && rating === 5) || generic;
}
