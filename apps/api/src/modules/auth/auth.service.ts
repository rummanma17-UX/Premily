import { prisma } from "../../lib/prisma.js";
import type { registerInput } from "./auth.schema.js";
import { hashPassword } from "./auth.utils.js";

export async function registerUser(data: registerInput) {
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
