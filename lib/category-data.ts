import { prisma } from "./prisma";
import type { Category as CategoryModel } from "@prisma/client";

export type Category = CategoryModel;

export async function getAllCategories(): Promise<Category[]> {
  return await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getCategoryById(id: string): Promise<Category | null> {
  return await prisma.category.findUnique({ where: { id } });
}

export async function createCategory(data: Omit<Category, "id" | "createdAt" | "updatedAt">): Promise<Category> {
  return await prisma.category.create({ data });
}

export async function updateCategory(id: string, data: Partial<Omit<Category, "id" | "createdAt" | "updatedAt">>): Promise<Category> {
  return await prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string): Promise<Category> {
  return await prisma.category.delete({ where: { id } });
}