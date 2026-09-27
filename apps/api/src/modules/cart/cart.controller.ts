import type { NextFunction, Response } from "express";
import { z } from "zod";
import type { AuthRequest } from "../../middleware/auth.js";
import { addToCartSchema } from "./cart.schema.js";
import {
  addToCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "./cart.service.js";

export async function addItem(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = addToCartSchema.parse(req.body);
    const userId = req.user!.userId;
    const item = await addToCart(userId, parsed);

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function viewCart(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.userId;
    const cart = await getCart(userId);
    res.json(cart ?? { items: [] });
  } catch (err) {
    next(err);
  }
}

export async function updateItem(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { quantity } = z
      .object({ quantity: z.number().int().positive() })
      .parse(req.body);

    const { itemId } = z
      .object({ itemId: z.string().min(1) })
      .parse(req.params);

    const userId = req.user!.userId;
    const item = await updateCartItem(userId, itemId, quantity);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function removeItem(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { itemId } = z
      .object({ itemId: z.string().min(1) })
      .parse(req.params);
    const userId = req.user!.userId;
    await removeCartItem(userId, itemId);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
