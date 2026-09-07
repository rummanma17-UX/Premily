import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../modules/auth/auth.utils.js";

export interface AuthRequest extends Request {
  user?: {
    userId: String;
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
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(
  ...allowedRoles: Array<"CUSTOMER" | "SELLER" | "ADMIN">
) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    next();
  };
}
