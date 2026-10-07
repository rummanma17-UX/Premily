import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Zod Validation failed",
      details: err.issues.map((issue) => ({
        field: issue.path.map(String).join("."),
        message: issue.message,
      })),
    });
    return;
  }

  const code = (err as { code?: string }).code;

  if (err instanceof Prisma.PrismaClientKnownRequestError && code === "P2002") {
    res.status(409).json({ error: "A record with this value already exists" });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}