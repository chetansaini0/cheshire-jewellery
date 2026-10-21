import { NextResponse } from "next/server";
import { recordCheckoutFulfillment } from "@cheshire/commerce";
import { fingerprintOrder, isDuplicateOrder, isSuspiciousAmount } from "@cheshire/commerce";

export async function POST(req: Request) {
  const body = await req.json();
  const items = Array.isArray(body.items) ? body.items : [];
  const address = body.address || {};
  if (!items.length) {
    return NextResponse.json({ error: "No fulfillable items" }, { status: 400 });
  }
  const total = Number(body.total || 0);
  if (isSuspiciousAmount(total)) {
    return NextResponse.json({ error: "Order requires review" }, { status: 400 });
  }
  const fingerprint = fingerprintOrder({
    phone: String(address.phone || ""),
    pincode: String(address.pincode || ""),
    total,
    skuKey: items.map((i: { product?: { sku?: string } }) => i.product?.sku).join(","),
  });
  if (isDuplicateOrder(fingerprint)) {
    return NextResponse.json({ error: "Duplicate order detected. Please wait a moment." }, { status: 429 });
  }

  const result = recordCheckoutFulfillment({
    items,
    address: {
      fullName: String(address.fullName || ""),
      phone: String(address.phone || ""),
      email: address.email,
      line1: String(address.line1 || ""),
      city: String(address.city || ""),
      state: String(address.state || ""),
      pincode: String(address.pincode || ""),
    },
    paymentMethod: String(body.paymentMethod || "RAZORPAY"),
    subtotal: Number(body.subtotal || 0),
    shipping: Number(body.shipping || 0),
    discount: Number(body.discount || 0),
    total,
  });

  try {
    const { routePaidOrder } = await import("@cheshire/integrations");
    await routePaidOrder({
      cheshireOrderNumber: result.orderNumber,
      paymentStatus: String(body.paymentMethod || "") === "COD" ? "COD" : "PAID",
      shipping: {
        fullName: String(address.fullName || ""),
        phone: String(address.phone || ""),
        line1: String(address.line1 || ""),
        city: String(address.city || ""),
        state: String(address.state || ""),
        pincode: String(address.pincode || ""),
      },
      items: items.map((item: { productId?: string; product?: { id?: string; sku?: string; name?: string; productType?: string }; quantity?: number; variantLabel?: string; supplierId?: string }) => ({
        productId: String(item.productId || item.product?.id || ""),
        sku: String(item.product?.sku || ""),
        name: String(item.product?.name || ""),
        quantity: Number(item.quantity || 1),
        size: item.variantLabel,
        productType: (item.product?.productType === "affiliate" || item.product?.productType === "marketplace"
          ? item.product.productType
          : "dropship") as "affiliate" | "dropship" | "marketplace",
        supplierId: item.supplierId,
      })),
    });
  } catch (error) {
    console.error("Supplier routing deferred", error instanceof Error ? error.message : "unknown");
  }

  return NextResponse.json(result);
}
