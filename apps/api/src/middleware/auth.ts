import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { verifyToken } from "../modules/auth/auth.utils.js";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: "CUSTOMER" | "SELLER" | "ADMIN";
  };
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(
  ...allowedRoles: Array<"CUSTOMER" | "SELLER" | "ADMIN">
) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { role: true },
      });

      if (!user) {
        res.status(401).json({ error: "User no longer exist" });
        return;
      }

      req.user.role = user.role;

      if (!allowedRoles.includes(user.role)) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
    } catch (err) {
      next(err);
    }
  };
}
