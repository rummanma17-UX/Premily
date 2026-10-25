import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "../../middleware/auth.js";
import {
  adminOrderQuerySchema,
  adminOrderStatusSchema,
  adminProductQuerySchema,
  updateStoreMartSchema,
  updateStoreVerificationSchema,
} from "./admin.schema.js";
import {
  getAdminDashboard,
  getAdminOrders,
  getAdminProducts,
  listAdminStores,
  setStoreMartStatus,
  setStoreVerificationStatus,
  updateAdminOrderStatus,
} from "./admin.service.js";

export async function dashboard(
  _req: AuthRequest,
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
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = adminProductQuerySchema.parse(req.query);
    const result = await getAdminProducts(query);
    res.json(result);
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
    res.json(result);
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
    const orderId = req.params.orderId as string;

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
        return;
      }
    }

    next(err);
  }
}

export async function listStores(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const result = await listAdminStores(page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateStoreMart(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const storeId = req.params.storeId as string;
    if (!storeId) {
      res.status(400).json({ error: "Store ID is required" });
      return;
    }
    const parsed = updateStoreMartSchema.parse(req.body);
    const updated = await setStoreMartStatus(storeId, parsed.isPremilyMart);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function updateStoreVerification(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const storeId = req.params.storeId as string;
    if (!storeId) {
      res.status(400).json({ error: "Store ID is required" });
      return;
    }
    const adminId = req.user!.userId;
    const parsed = updateStoreVerificationSchema.parse(req.body);
    const updated = await setStoreVerificationStatus(
      storeId,
      adminId,
      parsed.verificationStatus,
      parsed.verificationNote,
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
}
