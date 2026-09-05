import type { NextFunction, Request, Response } from "express";
import { registerSchema } from "./auth.schema.js";
import { registerUser } from "./auth.service.js";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = registerSchema.parse(req.body);
    const user = await registerUser(parsed);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}
