import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { verifyToken } from "../modules/auth/auth.utils.js";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: "CUSTOMER" | "SELLER" | "ADMIN";
  };
}

export async function requireAuth(
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
    const tokenPayload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: tokenPayload.userId },
      select: { id: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      res.clearCookie("token", { path: "/" });
      res.status(401).json({ error: "Account is unavailable" });
      return;
    }

    // Always use the database role, not a potentially stale JWT role.
    req.user = { userId: user.id, role: user.role };
    next();
  } catch (error) {
    if (error instanceof Error && error.name === "JsonWebTokenError") {
      res.clearCookie("token", { path: "/" });
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }
    if (error instanceof Error && error.name === "TokenExpiredError") {
      res.clearCookie("token", { path: "/" });
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }
    next(error);
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
