import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../../middleware/auth.js";
import { createProductSchema } from "./products.schema.js";
import {
  createProduct,
  getAllProducts,
  getMyProducts,
  getProductBySlug,
} from "./products.service.js";

export async function addProduct(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = createProductSchema.parse(req.body);
    const sellerId = req.user!.userId;
    const product = await createProduct(sellerId, parsed);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

export async function listProducts(
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (err) {
    next(err);
  }
}

export async function getProduct(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { storeSlug, productSlug } = req.params;

    const product = await getProductBySlug(
      storeSlug as string,
      productSlug as string,
    );

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function listMyProduct(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const sellerId = req.user!.userId;
    const products = await getMyProducts(sellerId);
    res.json(products);
  } catch (err) {
    next(err);
  }
}
