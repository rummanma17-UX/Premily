import type { NextFunction, Request, Response } from "express";
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
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const q = req.query.q as string | undefined;
    const category = req.query.category as string | undefined;
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
    const mart = req.query.mart === "true";
    const featured = req.query.featured === "true";
    const trending = req.query.trending === "true";
    const storeSlug = req.query.storeSlug as string | undefined;
    const sort = req.query.sort as any;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 24;

    const result = await getAllProducts({
      q,
      category,
      minPrice,
      maxPrice,
      mart,
      featured,
      trending,
      storeSlug,
      sort,
      page,
      limit,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const slug = (req.params.slug ?? req.params.productSlug) as string;
    const storeSlug = req.params.storeSlug as string | undefined;

    const product = await getProductBySlug(slug, storeSlug);

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
