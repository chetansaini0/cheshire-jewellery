import { NextResponse } from "next/server";
import { getRazorpayClient, getRazorpayKeyId, isRazorpayConfigured } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        { error: "Razorpay keys missing. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const amountRupees = Number(body.amount || 0);
    const receipt = String(body.orderId || `CH${Date.now()}`).slice(0, 40);

    if (!Number.isFinite(amountRupees) || amountRupees < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Razorpay expects amount in paise
    const amount = Math.round(amountRupees * 100);
    const rzp = getRazorpayClient();
    const order = await rzp.orders.create({
      amount,
      currency: "INR",
      receipt,
      notes: {
        brand: "CHESHIRE",
        source: "web-checkout",
      },
    });

    return NextResponse.json({
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: getRazorpayKeyId(),
      receipt,
    });
  } catch (error) {
    console.error("[razorpay/create]", error);
    return NextResponse.json({ error: "Unable to create Razorpay order" }, { status: 500 });
  }
}
