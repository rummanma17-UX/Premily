import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "../../middleware/auth.js";
import { updateStoreProfileSchema } from "./stores.schema.js";
import {
  getMyStore,
  getStoreBySlug,
  getStoreProducts,
  updateStoreProfile,
} from "./stores.service.js";

export async function getStore(req: Request, res: Response, next: NextFunction) {
  try {
    const slug = req.params.slug as string;
    if (!slug) {
      res.status(400).json({ error: "Store slug is required" });
      return;
    }
    const store = await getStoreBySlug(slug);
    if (!store) {
      res.status(404).json({ error: "Store not found" });
      return;
    }
    res.json(store);
  } catch (err) {
    next(err);
  }
}

export async function listStoreProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const slug = req.params.slug as string;
    if (!slug) {
      res.status(400).json({ error: "Store slug is required" });
      return;
    }
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const categoryId = req.query.category as string | undefined;
    const search = req.query.q as string | undefined;

    const result = await getStoreProducts(slug, {
      page,
      limit,
      categoryId,
      search,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getMine(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const sellerId = req.user!.userId;
    const store = await getMyStore(sellerId);
    if (!store) {
      res.status(404).json({ error: "Store not found" });
      return;
    }
    res.json(store);
  } catch (err) {
    next(err);
  }
}

export async function updateMine(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const sellerId = req.user!.userId;
    const parsed = updateStoreProfileSchema.parse(req.body);
    const updated = await updateStoreProfile(sellerId, parsed);
    res.json(updated);
  } catch (err) {
    if (err instanceof Error && err.message === "STORE_NOT_FOUND") {
      res.status(404).json({ error: "Store not found" });
      return;
    }
    next(err);
  }
}
