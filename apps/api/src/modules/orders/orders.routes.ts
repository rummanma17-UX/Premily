import { Router, Router as RouterType } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { buyNowCheckout, checkout, getOrder, myOrders, submitProof, verifyOrderPayment } from "./orders.controller.js";

export const ordersRouter: RouterType = Router();

ordersRouter.use(requireAuth);

ordersRouter.get("/", myOrders);
ordersRouter.get("/:orderId", getOrder);
ordersRouter.post("/checkout", checkout);
ordersRouter.post("/buy-now", buyNowCheckout);
ordersRouter.post("/:orderId/payment-proof", submitProof);
ordersRouter.post("/:orderId/verify-payment", requireRole("ADMIN", "SELLER"), verifyOrderPayment);

