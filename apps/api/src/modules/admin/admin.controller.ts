import type { NextFunction, Request, Response } from "express";
import { adminProductQuerySchema } from "./admin.schema.js";
import { getAdminDashboard, getAdminProducts } from "./admin.service.js";

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
