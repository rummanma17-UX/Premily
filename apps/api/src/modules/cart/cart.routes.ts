import { Router, Router as RouterType } from "express";
import { requireAuth } from "../../middleware/auth.js";
import {
  addItem,
  removeItem,
  updateItem,
  viewCart,
} from "./cart.controller.js";

export const cartRouter: RouterType = Router();

cartRouter.use(requireAuth);

cartRouter.get("/", viewCart);
cartRouter.post("/items", addItem);
cartRouter.patch("/items/:itemId", updateItem);
cartRouter.delete("/items/:itemId", removeItem);
