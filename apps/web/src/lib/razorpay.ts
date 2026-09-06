import { createHmac, timingSafeEqual } from "crypto";
import Razorpay from "razorpay";

function safeEqualHex(expectedHex: string, provided: string): boolean {
  try {
    const expected = Buffer.from(expectedHex, "hex");
    const actual = Buffer.from(provided, "hex");
    if (expected.length === 0 || expected.length !== actual.length) return false;
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

export function isRazorpayConfigured(): boolean {
  return Boolean(
    process.env.RAZORPAY_KEY_ID?.startsWith("rzp_") && process.env.RAZORPAY_KEY_SECRET
  );
}

export function getRazorpayKeyId(): string {
  const keyId = process.env.RAZORPAY_KEY_ID ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!keyId?.startsWith("rzp_")) {
    throw new Error("Razorpay is not configured. Add RAZORPAY_KEY_ID to apps/web/.env.local");
  }
  return keyId;
}

export function getRazorpayClient(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId?.startsWith("rzp_") || !keySecret) {
    throw new Error("Razorpay API keys are missing.");
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export function verifyPaymentSignature(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const payload = `${input.razorpayOrderId}|${input.razorpayPaymentId}`;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  return safeEqualHex(expected, input.razorpaySignature);
}
