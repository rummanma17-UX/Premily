import cors from "cors";
import express, { type Express } from "express";
import { errorHandler } from "./middleware/error-handler.js";
import { categoriesRouter } from "./modules/categories/categories.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use("/api/categories", categoriesRouter);
app.use("/api/auth", authRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler);

export default app;
