import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { productsRouter } from "./routes/products";
import { authRouter } from "./routes/auth";
import { cartRouter } from "./routes/cart";
import { ordersRouter } from "./routes/orders";
import { paymentsRouter } from "./routes/payments";
import { stylistRouter } from "./routes/stylist";
import { storesRouter } from "./routes/stores";
import { adminRouter } from "./routes/admin";
import { commerceRouter } from "./routes/commerce";
import { wishlistRouter } from "./routes/wishlist";
import { searchRouter } from "./routes/search";
import { affiliateRouter } from "./routes/affiliate";
import { suppliersRouter } from "./routes/suppliers";
import { integrationsRouter } from "./routes/integrations";
import { startIntegrationWorker } from "@cheshire/integrations";

const app = express();
const port = Number(process.env.API_PORT || 4000);

app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001",
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(
  rateLimit({
    windowMs: 60_000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/health", (_req, res) => res.json({ ok: true, service: "cheshire-api" }));

app.use("/api/products", productsRouter);
app.use("/api/auth", authRouter);
app.use("/api/cart", cartRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/stylist", stylistRouter);
app.use("/api/stores", storesRouter);
app.use("/api/search", searchRouter);
app.use("/api/admin", adminRouter);
app.use("/api/commerce", commerceRouter);
app.use("/api/affiliate", affiliateRouter);
app.use("/api/suppliers", suppliersRouter);
app.use("/api/integrations", integrationsRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`CHESHIRE API listening on :${port}`);
  startIntegrationWorker();
});
