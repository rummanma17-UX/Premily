import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

export async function hashPassword(plainPassword: string): Promise<string> {
  return argon2.hash(plainPassword, {
    type: argon2.argon2id,
  });
}
export async function verifyPassword(
  hash: string,
  plainPassword: string,
): Promise<boolean> {
  return argon2.verify(hash, plainPassword);
}

export type JwtPayload = {
  userId: string;
  role: "CUSTOMER" | "SELLER" | "ADMIN";
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
