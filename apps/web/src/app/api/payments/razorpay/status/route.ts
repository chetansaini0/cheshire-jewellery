import { NextResponse } from "next/server";
import { getRazorpayKeyId, isRazorpayConfigured } from "@/lib/razorpay";

export async function GET() {
  if (!isRazorpayConfigured()) {
    return NextResponse.json({ configured: false });
  }
  const keyId = getRazorpayKeyId();
  return NextResponse.json({
    configured: true,
    keyId,
    mode: keyId.includes("live") ? "live" : "test",
  });
}
