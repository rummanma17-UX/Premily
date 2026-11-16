import { Router, type Router as RouterType } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { buyNowCheckout, checkout, getOrder, myOrders, sellerOrders, submitProof, updateSellerOrder, verifyOrderPayment } from "./orders.controller.js";

export const ordersRouter: RouterType = Router();
ordersRouter.use(requireAuth);
ordersRouter.get("/", myOrders);
ordersRouter.get("/seller", requireRole("SELLER"), sellerOrders);
ordersRouter.get("/:orderId", getOrder);
ordersRouter.post("/checkout", checkout);
ordersRouter.post("/buy-now", buyNowCheckout);
ordersRouter.post("/:orderId/payment-proof", submitProof);
ordersRouter.patch("/:orderId/status", requireRole("SELLER"), updateSellerOrder);
ordersRouter.post("/:orderId/verify-payment", requireRole("ADMIN"), verifyOrderPayment);
