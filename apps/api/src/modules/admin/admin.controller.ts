import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "../../middleware/auth.js";
import {
  adminOrderQuerySchema,
  adminOrderStatusSchema,
  adminProductQuerySchema,
} from "./admin.schema.js";
import {
  getAdminDashboard,
  getAdminOrders,
  getAdminProducts,
  updateAdminOrderStatus,
} from "./admin.service.js";

export async function dashboard(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await getAdminDashboard();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function listAdminProducts(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = adminProductQuerySchema.parse(req.query);
    const data = await getAdminProducts(query);

    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function listAdminOrders(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = adminOrderQuerySchema.parse(req.query);
    const result = await getAdminOrders(query);

    res.json({ result });
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const orderId = req.params.orderId;

    if (!orderId || typeof orderId !== "string") {
      res.status(400).json({ error: "Invalid order ID" });
      return;
    }

    const input = adminOrderStatusSchema.parse(req.body);

    const order = await updateAdminOrderStatus(
      orderId,
      req.user!.userId,
      input,
    );

    res.json({ order });
  } catch (err) {
    if (err instanceof Error) {
      const errors: Record<string, { status: number; message: string }> = {
        ORDER_NOT_FOUND: {
          status: 404,
          message: "Order not found",
        },
        INVALID_STATUS_TRANSITION: {
          status: 409,
          message: "This order transition is not allowed",
        },
        ORDER_STATUS_CONFLICT: {
          status: 409,
          message: "Order status changed; refresh and try again",
        },
        PAYMENT_NOT_FOUND: {
          status: 409,
          message: "COD payment record not found",
        },
      };

      const knownError = errors[err.message];

      if (knownError) {
        res.status(knownError.status).json({ error: knownError.message });
        return
      }
    }
    
    next(err)
  }
}
