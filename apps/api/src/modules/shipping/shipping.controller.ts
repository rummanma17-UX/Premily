import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "../../middleware/auth.js";
import { calculateShippingSchema, updateStoreShippingSchema } from "./shipping.schema.js";
import {
  calculateShippingRates,
  getDistrictsList,
  updateStoreShipping,
} from "./shipping.service.js";

export async function getDistricts(_req: Request, res: Response, next: NextFunction) {
  try {
    const districts = await getDistrictsList();
    res.json(districts);
  } catch (err) {
    next(err);
  }
}

export async function calculateShipping(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = calculateShippingSchema.parse(req.body);
    const result = await calculateShippingRates(parsed);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateMyStoreShipping(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const sellerId = req.user!.userId;
    const parsed = updateStoreShippingSchema.parse(req.body);
    const updated = await updateStoreShipping(sellerId, parsed);
    res.json(updated);
  } catch (err) {
    if (err instanceof Error && err.message === "STORE_NOT_FOUND") {
      res.status(404).json({ error: "Store not found for this seller" });
      return;
    }
    next(err);
  }
}
