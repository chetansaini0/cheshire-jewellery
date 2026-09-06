import { NextResponse } from "next/server";
import { isRazorpayConfigured, verifyPaymentSignature } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    if (!isRazorpayConfigured()) {
      return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });
    }

    const body = await req.json();
    const razorpay_order_id = String(body.razorpay_order_id || "");
    const razorpay_payment_id = String(body.razorpay_payment_id || "");
    const razorpay_signature = String(body.razorpay_signature || "");

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
    }

    const ok = verifyPaymentSignature({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    if (!ok) {
      return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error) {
    console.error("[razorpay/verify]", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
