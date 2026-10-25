import { Router, type Router as RouterType } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import {
  getMine,
  getStore,
  listStoreProducts,
  updateMine,
} from "./stores.controller.js";

export const storesRouter: RouterType = Router();

storesRouter.get("/mine", requireAuth, requireRole("SELLER"), getMine);
storesRouter.put("/mine", requireAuth, requireRole("SELLER"), updateMine);
storesRouter.get("/:slug/products", listStoreProducts);
storesRouter.get("/:slug", getStore);
