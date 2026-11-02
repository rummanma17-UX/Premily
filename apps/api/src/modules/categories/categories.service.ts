import { prisma } from "../../lib/prisma.js";
import type { CreateCategoryInput, UpdateCategoryInput } from "./categories.schema.js";

export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
  });
}

export async function createCategory(data: CreateCategoryInput) {
  return prisma.category.create({ data });
}

export async function updateCategory(id: string, data: UpdateCategoryInput) {
  return prisma.category.update({ where: { id }, data });
}
