import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "../../middleware/auth.js";
import { createProductSchema, updateProductSchema } from "./products.schema.js";
import { archiveProduct, createProduct, getAllProducts, getMyProducts, getProductBySlug, updateProduct as updateProductService } from "./products.service.js";

export async function addProduct(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const parsed = createProductSchema.parse(req.body);
    const product = await createProduct(req.user!.userId, parsed);
    res.status(201).json(product);
  } catch (err) {
    if (err instanceof Error && err.message === "STORE_NOT_FOUND") {
      res.status(404).json({ error: "Store not found for this seller" });
      return;
    }
    next(err);
  }
}

export async function updateProduct(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const productId = req.params.productId as string;
    const parsed = updateProductSchema.parse(req.body);
    res.json(await updateProductService(req.user!.userId, productId, parsed));
  } catch (err) {
    if (err instanceof Error && err.message === "PRODUCT_NOT_FOUND") {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    next(err);
  }
}

export async function deleteProduct(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await archiveProduct(req.user!.userId, req.params.productId as string);
    res.status(204).send();
  } catch (err) {
    if (err instanceof Error && err.message === "PRODUCT_NOT_FOUND") {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    next(err);
  }
}

export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const parseOptionalNumber = (value: unknown) => {
      if (typeof value !== "string" || value.trim() === "") return undefined;
      const number = Number(value);
      if (!Number.isFinite(number) || number < 0) throw new Error("INVALID_PRICE_FILTER");
      return number;
    };
    const result = await getAllProducts({
      q: typeof req.query.q === "string" ? req.query.q.trim() : undefined,
      category: typeof req.query.category === "string" ? req.query.category : undefined,
      minPrice: parseOptionalNumber(req.query.minPrice),
      maxPrice: parseOptionalNumber(req.query.maxPrice),
      mart: req.query.mart === "true",
      featured: req.query.featured === "true",
      trending: req.query.trending === "true",
      storeSlug: typeof req.query.storeSlug === "string" ? req.query.storeSlug : undefined,
      sort: ["newest", "price_asc", "price_desc", "rating", "popular"].includes(String(req.query.sort)) ? req.query.sort as any : "newest",
      page: Math.max(1, Number(req.query.page) || 1),
      limit: Math.min(50, Math.max(1, Number(req.query.limit) || 24)),
    });
    res.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === "INVALID_PRICE_FILTER") {
      res.status(400).json({ error: "Price filters must be non-negative numbers" });
      return;
    }
    next(err);
  }
}

export async function getProduct(req: Request, res: Response, next: NextFunction) {
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

export async function listMyProduct(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await getMyProducts(req.user!.userId));
  } catch (err) {
    next(err);
  }
}
