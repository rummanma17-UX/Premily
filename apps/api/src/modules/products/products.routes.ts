import { Router, type Router as RouterType } from "express";
import { addProduct, listProducts } from "./products.controller.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";

export const productsRouter: RouterType = Router();

productsRouter.get("/", listProducts);
productsRouter.post("/", requireAuth, requireRole("SELLER"),addProduct);