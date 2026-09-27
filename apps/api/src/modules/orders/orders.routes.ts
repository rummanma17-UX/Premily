import { Router, Router as RouterType } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { buyNowCheckout, checkout, getOrder, myOrders } from "./orders.controller.js";

export const ordersRouter: RouterType = Router();

ordersRouter.use(requireAuth);

ordersRouter.get("/", myOrders);
ordersRouter.get("/:orderId", getOrder);
ordersRouter.post("/checkout", checkout);
ordersRouter.post("/buy-now", buyNowCheckout);
