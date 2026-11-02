import type { Request, Response, NextFunction } from "express";
import {
  getAllCategories,
  createCategory,
  updateCategory,
} from "./categories.service.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./categories.schema.js";

export async function listCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await getAllCategories());
  } catch (err) {
    next(err);
  }
}

export async function addCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createCategorySchema.parse(req.body);
    res.status(201).json(await createCategory(parsed));
  } catch (err) {
    next(err);
  }
}

export async function editCategory(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = updateCategorySchema.parse(req.body);
    res.json(await updateCategory(req.params.id, parsed));
  } catch (err) {
    next(err);
  }
}
