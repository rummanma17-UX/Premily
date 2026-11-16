import type { NextFunction, Response } from "express";
import { z } from "zod";
import type { AuthRequest } from "../../middleware/auth.js";
import { addToCartSchema } from "./cart.schema.js";
import { addToCart, clearCart, getCart, removeCartItem, updateCartItem } from "./cart.service.js";

function respondKnownCartError(error: unknown, res: Response): boolean {
  if (!(error instanceof Error)) return false;
  const errors: Record<string, { status: number; message: string }> = {
    PRODUCT_UNAVAILABLE: { status: 404, message: "This product is no longer available" },
    INSUFFICIENT_STOCK: { status: 409, message: "Requested quantity exceeds available stock" },
    CART_NOT_FOUND: { status: 404, message: "Cart not found" },
    ITEM_NOT_FOUND: { status: 404, message: "Cart item not found" },
  };
  const match = errors[error.message];
  if (!match) return false;
  res.status(match.status).json({ error: match.message });
  return true;
}

export async function addItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await addToCart(req.user!.userId, addToCartSchema.parse(req.body)));
  } catch (err) {
    if (respondKnownCartError(err, res)) return;
    next(err);
  }
}

export async function viewCart(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await getCart(req.user!.userId) ?? { items: [] });
  } catch (err) { next(err); }
}

export async function updateItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { quantity } = z.object({ quantity: z.number().int().positive() }).parse(req.body);
    const { itemId } = z.object({ itemId: z.string().min(1) }).parse(req.params);
    res.json(await updateCartItem(req.user!.userId, itemId, quantity));
  } catch (err) {
    if (respondKnownCartError(err, res)) return;
    next(err);
  }
}

export async function removeItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { itemId } = z.object({ itemId: z.string().min(1) }).parse(req.params);
    await removeCartItem(req.user!.userId, itemId);
    res.status(204).send();
  } catch (err) {
    if (respondKnownCartError(err, res)) return;
    next(err);
  }
}

export async function clear(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await clearCart(req.user!.userId);
    res.status(204).send();
  } catch (err) { next(err); }
}
