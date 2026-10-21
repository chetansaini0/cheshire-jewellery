import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";

export const authRouter = Router();

const otps = new Map<string, { code: string; expires: number }>();

authRouter.post("/otp/request", (req, res) => {
  const parsed = z.object({ target: z.string().min(5) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid target" });
  const code = process.env.NODE_ENV === "production" ? String(Math.floor(100000 + Math.random() * 900000)) : "123456";
  otps.set(parsed.data.target, { code, expires: Date.now() + 10 * 60_000 });
  // Production: send via SMS/email provider. Never log OTP in production.
  if (process.env.NODE_ENV !== "production") {
    console.log(`[dev otp] ${parsed.data.target} => ${code}`);
  }
  return res.json({ ok: true });
});

authRouter.post("/otp/verify", (req, res) => {
  const parsed = z.object({ target: z.string(), code: z.string() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });
  const record = otps.get(parsed.data.target);
  if (!record || record.expires < Date.now() || record.code !== parsed.data.code) {
    return res.status(401).json({ error: "Invalid or expired OTP" });
  }
  otps.delete(parsed.data.target);
  const secret = process.env.JWT_SECRET || "dev-secret";
  const user = {
    id: `user_${Buffer.from(parsed.data.target).toString("hex").slice(0, 12)}`,
    email: parsed.data.target.includes("@") ? parsed.data.target : null,
    phone: parsed.data.target.includes("@") ? null : parsed.data.target,
    name: null,
    role: "CUSTOMER" as const,
    rewards: { points: 0, tier: "MEMBER" as const, lifetimePoints: 0, nextTierPoints: 500 },
    notificationPrefs: {
      orderUpdates: true,
      drops: true,
      promotions: true,
      wishlistAlerts: true,
    },
  };
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"];
  const token = jwt.sign({ sub: user.id, role: user.role }, secret, {
    expiresIn,
  });
  return res.json({ token, user });
});

authRouter.get("/me", (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    const secret = process.env.JWT_SECRET || "dev-secret";
    const payload = jwt.verify(header.slice(7), secret) as { sub: string; role: string };
    return res.json({
      id: payload.sub,
      role: payload.role,
      rewards: { points: 0, tier: "MEMBER", lifetimePoints: 0, nextTierPoints: 500 },
      notificationPrefs: {
        orderUpdates: true,
        drops: true,
        promotions: true,
        wishlistAlerts: true,
      },
    });
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
});
