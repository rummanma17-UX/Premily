import { prisma } from "../../lib/prisma.js";
import type { CreateCategoryInput, UpdateCategoryInput } from "./categories.schema.js";

export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
  });
}

export async function createCategory(data: CreateCategoryInput) {
  const prismaData = {
    name: data.name,
    slug: data.slug,
    icon: data.icon,
    ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
  };

  return prisma.category.create({ data: prismaData });
}

export async function updateCategory(id: string, data: UpdateCategoryInput) {
  const prismaData = {
    ...(data.name !== undefined ? { name: data.name } : {}),
    ...(data.slug !== undefined ? { slug: data.slug } : {}),
    ...(data.icon !== undefined ? { icon: data.icon } : {}),
    ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
  };

  return prisma.category.update({
    where: { id },
    data: prismaData,
  });
}
