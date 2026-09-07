import type { NextFunction, Request, Response } from "express";
import { loginSchema, registerSchema } from "./auth.schema.js";
import { loginUser, registerUser } from "./auth.service.js";
import { env } from "../../config/env.js";

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

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = loginSchema.parse(req.body);
    const { user, token } = await loginUser(parsed);
    res.cookie("token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
}
