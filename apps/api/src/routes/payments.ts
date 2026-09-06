import { Router } from "express";
import crypto from "crypto";

export const paymentsRouter = Router();

function isConfigured() {
  return Boolean(
    process.env.RAZORPAY_KEY_ID?.startsWith("rzp_") && process.env.RAZORPAY_KEY_SECRET
  );
}

paymentsRouter.get("/razorpay/status", (_req, res) => {
  if (!isConfigured()) return res.json({ configured: false });
  const keyId = process.env.RAZORPAY_KEY_ID!;
  return res.json({
    configured: true,
    keyId,
    mode: keyId.includes("live") ? "live" : "test",
  });
});

paymentsRouter.post("/razorpay/create", async (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const amountRupees = Number(req.body.amount || 0);
  const orderId = String(req.body.orderId || `CH${Date.now()}`).slice(0, 40);

  if (!isConfigured()) {
    return res.status(500).json({ error: "Razorpay keys missing on API" });
  }

  if (!Number.isFinite(amountRupees) || amountRupees < 1) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  try {
    const Razorpay = (await import("razorpay")).default;
    const rzp = new Razorpay({ key_id: keyId!, key_secret: keySecret! });
    const order = await rzp.orders.create({
      amount: Math.round(amountRupees * 100),
      currency: "INR",
      receipt: orderId,
      notes: { brand: "CHESHIRE", source: "api" },
    });
    return res.json({
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      orderId,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Unable to create Razorpay order" });
  }
});

paymentsRouter.post("/razorpay/verify", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return res.status(500).json({ ok: false, error: "Missing secret" });
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  if (expected !== razorpay_signature) return res.status(400).json({ ok: false });
  return res.json({ ok: true, paymentId: razorpay_payment_id, orderId: razorpay_order_id });
});
