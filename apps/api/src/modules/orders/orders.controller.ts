import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../../middleware/auth.js";
import {
  buyNowSchema,
  checkoutSchema,
  paymentProofSchema,
} from "./orders.schema.js";
import {
  buyNow,
  checkoutFromCart,
  getMyOrders,
  getOrderById,
  OutOfStockError,
  submitPaymentProof,
  verifyPayment,
} from "./orders.service.js";

export async function checkout(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = checkoutSchema.parse(req.body);
    const userId = req.user!.userId;
    const order = await checkoutFromCart(userId, parsed);
    res.status(201).json(order);
  } catch (err) {
    if (err instanceof Error && err.message === "CART_EMPTY") {
      res.status(400).json({ error: "Your cart is empty" });
      return;
    }
    next(err);
  }
}

export async function buyNowCheckout(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = buyNowSchema.parse(req.body);
    const userId = req.user!.userId;
    const order = await buyNow(
      userId,
      parsed,
      parsed.variantId,
      parsed.quantity,
    );
    res.status(201).json(order);
  } catch (err) {
    if (err instanceof OutOfStockError) {
      res.status(409).json({ error: (err as OutOfStockError).message });
      return;
    }
    next(err);
  }
}

export async function myOrders(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.userId;
    const orders = await getMyOrders(userId);
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

export async function getOrder(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { orderId } = req.params;

    if (!orderId || typeof orderId !== "string") {
      res.status(400).json({ error: "Invalid or missing orderId" });
      return;
    }
    const userId = req.user!.userId;
    const order = await getOrderById(userId, orderId);

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function submitProof(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const orderId = req.params.orderId;
    if (!orderId || typeof orderId !== "string") {
      return res
        .status(400)
        .json({ error: "Invalid or missing orderId parameter" });
    }
    const parsed = paymentProofSchema.parse(req.body);
    const userId = req.user!.userId;
    const payment = await submitPaymentProof(userId, orderId, parsed);
    res.json(payment);
  } catch (err) {
    if (err instanceof Error && err.message === "ORDER_NOT_FOUND") {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    if (err instanceof Error && err.message === "NOT_MOBILE_PAYMENT") {
      res
        .status(400)
        .json({ error: "This order doesn't require payment proof" });
      return;
    }
    if (err instanceof Error && err.message === "ALREADY_VERIFIED") {
      res.status(400).json({ error: "Payment already verified" });
      return;
    }

    next(err);
  }
}

export async function verifyOrderPayment(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const orderId = req.params.orderId;
    if (!orderId || typeof orderId !== "string") {
      return res
        .status(400)
        .json({ error: "Invalid or missing orderId parameter" });
    }
    const verifierId = req.user!.userId;
    const order = await verifyPayment(verifierId, orderId);
    res.json(order);
  } catch (err) {
    if (err instanceof Error && err.message === "ORDER_NOT_FOUND") {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    next(err);
  }
}
