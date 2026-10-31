import { prisma } from "../../lib/prisma.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";
import { hashPassword, signToken, verifyPassword } from "./auth.utils.js";

export async function registerUser(data: RegisterInput) {
  const hashedPassword = await hashPassword(data.password);
  const email =
    data.email && data.email.trim().length > 0
      ? data.email.trim().toLowerCase()
      : null;

  const user = await prisma.user.create({
    data: {
      name: data.name.trim(),
      email,
      phone: data.phone.trim(),
      password: hashedPassword,
      role: data.role,
    },
  });

  const { password: _password, ...safeUser } = user;
  const token = signToken({ userId: user.id, role: user.role });
  return { user: safeUser, token };
}

export async function loginUser(data: LoginInput) {
  const rawIdentifier = data.identifier.trim();
  const isPhone = /^01[3-9]\d{8}$/.test(rawIdentifier);

  const user = await prisma.user.findFirst({
    where: isPhone
      ? { phone: rawIdentifier }
      : { email: rawIdentifier.toLowerCase() },
  });

  if (!user || !user.isActive) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const isValid = await verifyPassword(user.password, data.password);
  if (!isValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = signToken({ userId: user.id, role: user.role });
  const { password: _password, ...safeUser } = user;
  return { user: safeUser, token };
}
