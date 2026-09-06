import { Router } from "express";
import { generateOrderNumber } from "@cheshire/utils";

const orders: Array<Record<string, unknown>> = [];

export const ordersRouter = Router();

ordersRouter.get("/", (_req, res) => {
  res.json(orders);
});

ordersRouter.get("/:id", (req, res) => {
  const order = orders.find((o) => o.id === req.params.id || o.orderNumber === req.params.id);
  if (!order) return res.status(404).json({ error: "Not found" });
  return res.json(order);
});

ordersRouter.post("/", (req, res) => {
  const order = {
    id: `ord_${Date.now()}`,
    orderNumber: generateOrderNumber(),
    status: "PLACED",
    paymentStatus: "PENDING",
    paymentMethod: req.body.paymentMethod || "RAZORPAY",
    items: req.body.items || [],
    subtotal: req.body.subtotal || 0,
    discount: req.body.discount || 0,
    shipping: req.body.shipping || 0,
    total: req.body.total || 0,
    address: req.body.address,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  orders.unshift(order);
  res.status(201).json(order);
});
