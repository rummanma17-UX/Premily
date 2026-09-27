import { prisma } from "../../lib/prisma.js";
import type { CreateCategoryInput } from "./categories.schema.js";

export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createCategory(data: CreateCategoryInput) {
  return prisma.category.create({ data });
}

