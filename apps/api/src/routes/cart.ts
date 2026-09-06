import { Router } from "express";
import { calcShipping, FREE_SHIPPING_THRESHOLD } from "@cheshire/utils";

type CartItem = { id: string; productId: string; quantity: number; price: number; name: string };

const carts = new Map<string, { items: CartItem[]; couponCode?: string }>();

function key(req: { headers: Record<string, unknown> }) {
  const auth = String(req.headers.authorization || "");
  const session = String(req.headers["x-session-id"] || "anon");
  return auth || session;
}

export const cartRouter = Router();

cartRouter.get("/", (req, res) => {
  const cart = carts.get(key(req as never)) || { items: [] };
  const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = calcShipping(subtotal);
  res.json({
    id: key(req as never),
    items: cart.items,
    subtotal,
    discount: 0,
    shipping,
    total: subtotal + shipping,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    amountToFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
    couponCode: cart.couponCode || null,
  });
});

cartRouter.post("/items", (req, res) => {
  const k = key(req as never);
  const cart = carts.get(k) || { items: [] };
  const { productId, quantity = 1, price = 0, name = "Product" } = req.body || {};
  const existing = cart.items.find((i) => i.productId === productId);
  if (existing) existing.quantity += quantity;
  else cart.items.push({ id: `${productId}-${Date.now()}`, productId, quantity, price, name });
  carts.set(k, cart);
  res.status(201).json({ ok: true, items: cart.items });
});

cartRouter.patch("/items/:id", (req, res) => {
  const k = key(req as never);
  const cart = carts.get(k);
  if (!cart) return res.status(404).json({ error: "Cart not found" });
  const item = cart.items.find((i) => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Item not found" });
  item.quantity = Number(req.body.quantity || 1);
  carts.set(k, cart);
  return res.json({ ok: true });
});

cartRouter.delete("/items/:id", (req, res) => {
  const k = key(req as never);
  const cart = carts.get(k);
  if (!cart) return res.status(404).json({ error: "Cart not found" });
  cart.items = cart.items.filter((i) => i.id !== req.params.id);
  carts.set(k, cart);
  return res.json({ ok: true });
});

cartRouter.post("/coupon", (req, res) => {
  const k = key(req as never);
  const cart = carts.get(k) || { items: [] };
  cart.couponCode = String(req.body.code || "").toUpperCase();
  carts.set(k, cart);
  res.json({ ok: true, couponCode: cart.couponCode });
});
