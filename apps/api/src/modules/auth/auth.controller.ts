import type { NextFunction, Request, Response } from "express";
import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import type { AuthRequest } from "../../middleware/auth.js";
import { loginSchema, registerSchema } from "./auth.schema.js";
import { loginUser, registerUser } from "./auth.service.js";

const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? "none" as const : "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = registerSchema.parse(req.body);
    const { user, token } = await registerUser(parsed);
    res.cookie("token", token, AUTH_COOKIE_OPTIONS);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = loginSchema.parse(req.body);
    const { user, token } = await loginUser(parsed);
    res.cookie("token", token, AUTH_COOKIE_OPTIONS);
    res.json({ user });
  } catch (err) {
    if (err instanceof Error && err.message === "INVALID_CREDENTIALS") {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    next(err);
  }
}

export async function logout(_req: AuthRequest, res: Response) {
  res.clearCookie("token", { path: "/" });
  res.status(204).send();
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });

    if (!user || !user.isActive) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const { password: _password, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (err) {
    next(err);
  }
}
