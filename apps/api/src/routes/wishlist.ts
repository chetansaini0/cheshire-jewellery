import { Router } from "express";

const wishlists = new Map<string, Set<string>>();

function uid(req: { headers: Record<string, unknown> }) {
  return String(req.headers.authorization || req.headers["x-session-id"] || "anon");
}

export const wishlistRouter = Router();

wishlistRouter.get("/", (req, res) => {
  const set = wishlists.get(uid(req as never)) || new Set();
  res.json(Array.from(set));
});

wishlistRouter.post("/toggle", (req, res) => {
  const id = uid(req as never);
  const set = wishlists.get(id) || new Set<string>();
  const productId = String(req.body.productId || "");
  if (set.has(productId)) {
    set.delete(productId);
    wishlists.set(id, set);
    return res.json({ wishlisted: false });
  }
  set.add(productId);
  wishlists.set(id, set);
  return res.json({ wishlisted: true });
});
