import { Router, type Router as RouterType } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import {
  addProduct,
  deleteProduct,
  getProduct,
  listMyProduct,
  listProducts,
  updateProduct,
} from "./products.controller.js";

export const productsRouter: RouterType = Router();

productsRouter.get("/mine", requireAuth, requireRole("SELLER"), listMyProduct);
productsRouter.get("/item/:slug", getProduct);
productsRouter.get("/:storeSlug/products/:productSlug", getProduct);
productsRouter.get("/:slug", getProduct);
productsRouter.get("/", listProducts);
productsRouter.post("/", requireAuth, requireRole("SELLER"), addProduct);
productsRouter.patch("/:productId", requireAuth, requireRole("SELLER"), updateProduct);
productsRouter.delete("/:productId", requireAuth, requireRole("SELLER"), deleteProduct);
