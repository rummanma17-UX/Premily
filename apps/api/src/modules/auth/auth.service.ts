import { prisma } from "../../lib/prisma.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";
import { hashPassword, signToken, verifyPassword } from "./auth.utils.js";

export async function registerUser(data: RegisterInput) {
  const hashedPassword = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      role: data.role,
    },
  });

  const { password, ...safeUser } = user;
  return safeUser;
}

export async function loginUser(data: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const isValid = await verifyPassword(user.password, data.password);

  if (!isValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = signToken({ userId: user.id, role: user.role });

  const { password, ...safeUser } = user;
  return { user: safeUser, token}
}
