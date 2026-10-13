
import { cpSync } from "node:fs";

cpSync("src/generated/prisma", "dist/generated/prisma", {
  recursive: true,
});

console.log("Prisma Client copied to dist/generated/prisma");

