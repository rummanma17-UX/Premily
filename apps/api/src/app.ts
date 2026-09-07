import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import { requireAuth, type AuthRequest } from "./middleware/auth.js";
import { errorHandler } from "./middleware/error-handler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { categoriesRouter } from "./modules/categories/categories.routes.js";
import { productsRouter } from "./modules/products/products.routes.js";

const app: Express = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/categories", categoriesRouter);
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.get("/api/me", requireAuth, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler);

export default app;
