import { prisma } from "@/lib/prisma";
import type { Category } from "@prisma/client";

export async function getAllCategories(): Promise<Category[]> {
  return await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getCategoryById(id: string): Promise<Category | null> {
  return await prisma.category.findUnique({ where: { id } });
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return await prisma.category.findUnique({ where: { slug } });
}

export async function createCategory(
  data: Omit<Category, "id" | "createdAt" | "updatedAt">
): Promise<Category> {
  return await prisma.category.create({ data });
}

export async function updateCategory(
  id: string,
  data: Partial<Omit<Category, "id" | "createdAt" | "updatedAt">>
): Promise<Category> {
  return await prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string): Promise<Category> {
  return await prisma.category.delete({ where: { id } });
}
