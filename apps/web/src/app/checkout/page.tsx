"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatINR } from "@cheshire/utils";
import { useCartTotals, useCommerceStore } from "@/store/commerce";
import { openRazorpayCheckout } from "@/lib/razorpay-client";

const steps = ["ADDRESS", "DELIVERY", "PAYMENT", "CONFIRMATION"] as const;

type AddressForm = {
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
};

export default function CheckoutPage() {
  const [step, setStep] = useState(0);
  const [payment, setPayment] = useState("Razorpay");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [razorpayMode, setRazorpayMode] = useState<"test" | "live" | "unconfigured">("unconfigured");
  const [address, setAddress] = useState<AddressForm>({
    fullName: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const cart = useCommerceStore((s) => s.cart);
  const clearCart = useCommerceStore((s) => s.clearCart);
  const { subtotal, shipping, discount, total } = useCartTotals();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/payments/razorpay/status")
      .then((r) => r.json())
      .then((d) => {
        if (!d.configured) setRazorpayMode("unconfigured");
        else setRazorpayMode(d.mode === "live" ? "live" : "test");
      })
      .catch(() => setRazorpayMode("unconfigured"));
  }, []);

  if (!cart.length && !orderId) {
    return (
      <div className="mx-auto max-w-site px-4 py-16">
        <p>Your cart is empty.</p>
        <button type="button" className="mt-4 underline" onClick={() => router.push("/shop")}>
          Shop CHESHIRE
        </button>
      </div>
    );
  }

  async function payWithRazorpay() {
    setPaying(true);
    setError(null);
    try {
      const localOrderId = `CH${Date.now().toString().slice(-10)}`;
      const createRes = await fetch("/api/payments/razorpay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total, orderId: localOrderId }),
      });
      const created = await createRes.json();
      if (!createRes.ok) throw new Error(created.error || "Could not create payment order");

      const result = await openRazorpayCheckout({
        keyId: created.keyId,
        amount: created.amount,
        currency: created.currency || "INR",
        orderId: created.razorpayOrderId,
        name: "CHESHIRE",
        description: `Order ${localOrderId}`,
        prefill: {
          name: address.fullName,
          contact: address.phone,
        },
        notes: {
          cheshire_order: localOrderId,
          city: address.city,
        },
      });

      const verifyRes = await fetch("/api/payments/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });
      const verified = await verifyRes.json();
      if (!verifyRes.ok || !verified.ok) {
        throw new Error(verified.error || "Payment verification failed");
      }

      setOrderId(localOrderId);
      setPaymentId(verified.paymentId);
      clearCart();
      setStep(3);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Payment failed";
      if (message !== "Payment cancelled") setError(message);
    } finally {
      setPaying(false);
    }
  }

  function placeCod() {
    const id = `CH${Date.now().toString().slice(-10)}`;
    setOrderId(id);
    clearCart();
    setStep(3);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-4xl">Checkout</h1>
      <ol className="mt-6 flex flex-wrap gap-3 text-[10px] tracking-[0.16em] uppercase text-muted">
        {steps.map((s, i) => (
          <li key={s} className={i === step ? "text-ink" : ""}>
            {i + 1}. {s}
          </li>
        ))}
      </ol>

      <div className="mt-10 border border-line p-6">
        {step === 0 && (
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              setAddress({
                fullName: String(fd.get("fullName") || ""),
                phone: String(fd.get("phone") || ""),
                line1: String(fd.get("line1") || ""),
                city: String(fd.get("city") || ""),
                state: String(fd.get("state") || ""),
                pincode: String(fd.get("pincode") || ""),
              });
              setStep(1);
            }}
          >
            <h2 className="text-sm tracking-[0.16em] uppercase">Shipping address</h2>
            <input name="fullName" required placeholder="Full name" className="border border-line bg-transparent px-3 py-3" />
            <input name="phone" required placeholder="Phone" className="border border-line bg-transparent px-3 py-3" />
            <input name="line1" required placeholder="Address line 1" className="border border-line bg-transparent px-3 py-3" />
            <div className="grid gap-4 sm:grid-cols-3">
              <input name="city" required placeholder="City" className="border border-line bg-transparent px-3 py-3" />
              <input name="state" required placeholder="State" className="border border-line bg-transparent px-3 py-3" />
              <input name="pincode" required placeholder="PIN" className="border border-line bg-transparent px-3 py-3" />
            </div>
            <button type="submit" className="mt-2 bg-ink py-3 text-[11px] tracking-[0.16em] uppercase text-ivory">
              Continue to delivery
            </button>
          </form>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-sm tracking-[0.16em] uppercase">Delivery</h2>
            <label className="mt-4 flex items-start gap-3 border border-ink p-4">
              <input type="radio" defaultChecked name="delivery" />
              <span>
                <span className="block text-sm">Standard (3–6 days)</span>
                <span className="text-xs text-muted">
                  {shipping ? formatINR(shipping) : "FREE over ₹999"}
                </span>
              </span>
            </label>
            <button
              type="button"
              className="mt-6 bg-ink px-6 py-3 text-[11px] tracking-[0.16em] uppercase text-ivory"
              onClick={() => setStep(2)}
            >
              Continue to payment
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-sm tracking-[0.16em] uppercase">Payment</h2>
            <p className="mt-2 text-xs text-muted">
              Powered by your Razorpay account. Card details never touch CHESHIRE servers.
            </p>
            <p className="mt-2 text-[11px] tracking-[0.14em] uppercase text-muted">
              Gateway:{" "}
              {razorpayMode === "unconfigured"
                ? "Not configured"
                : razorpayMode === "live"
                  ? "Live"
                  : "Test mode"}
            </p>

            <div className="mt-4 space-y-2">
              {["Razorpay", "COD"].map((m) => (
                <label key={m} className="flex items-center gap-3 border border-line p-3">
                  <input
                    type="radio"
                    name="pay"
                    checked={payment === m}
                    onChange={() => setPayment(m)}
                  />
                  {m === "Razorpay" ? "UPI / Cards / Net Banking / Wallets (Razorpay)" : "Cash on Delivery"}
                </label>
              ))}
            </div>

            <div className="mt-6 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>-{formatINR(discount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping ? formatINR(shipping) : "FREE"}</span>
              </div>
              <div className="flex justify-between pt-2 text-base">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>

            {error ? <p className="mt-4 text-sm text-sale">{error}</p> : null}

            <button
              type="button"
              disabled={paying || (payment === "Razorpay" && razorpayMode === "unconfigured")}
              className="mt-6 w-full bg-ink py-3 text-[11px] tracking-[0.16em] uppercase text-ivory disabled:opacity-50"
              onClick={() => {
                if (payment === "COD") placeCod();
                else void payWithRazorpay();
              }}
            >
              {paying
                ? "Opening Razorpay…"
                : payment === "COD"
                  ? `Place COD order · ${formatINR(total)}`
                  : `Pay ${formatINR(total)}`}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <p className="text-[11px] tracking-[0.18em] uppercase text-muted">Order confirmed</p>
            <h2 className="mt-3 font-serif text-4xl">Thank you.</h2>
            <p className="mt-3 text-sm text-muted">Order {orderId}</p>
            {paymentId ? (
              <p className="mt-1 text-xs text-muted">Razorpay payment {paymentId}</p>
            ) : (
              <p className="mt-1 text-xs text-muted">Cash on Delivery</p>
            )}
            <p className="mt-2 text-sm">Track status: Placed → Confirmed → Packed → Shipped → Delivered</p>
            <a href="/account/orders" className="mt-6 inline-block underline">
              View orders
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
