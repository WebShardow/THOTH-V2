import { prisma } from "@/lib/prisma";
import type { Project, Category, Prisma } from "@prisma/client";

export type ProjectWithCategory = Project & {
  category: Category;
};

export async function getAllProjects(
  options?: {
    published?: boolean;
    featured?: boolean;
    categoryId?: string;
  }
): Promise<ProjectWithCategory[]> {
  const where: Prisma.ProjectWhereInput = {};
  
  if (options?.published !== undefined) {
    where.isPublished = options.published;
  }
  if (options?.featured !== undefined) {
    where.featured = options.featured;
  }
  if (options?.categoryId) {
    where.categoryId = options.categoryId;
  }

  return await prisma.project.findMany({
    where,
    include: { category: true },
    orderBy: { date: "desc" },
  });
}

export async function getProjectById(id: string): Promise<ProjectWithCategory | null> {
  return await prisma.project.findUnique({
    where: { id },
    include: { category: true },
  });
}

export async function createProject(
  data: Omit<Project, "id" | "createdAt" | "updatedAt">
): Promise<ProjectWithCategory> {
  return await prisma.project.create({
    data,
    include: { category: true },
  });
}

export async function updateProject(
  id: string,
  data: Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>
): Promise<ProjectWithCategory> {
  return await prisma.project.update({
    where: { id },
    data,
    include: { category: true },
  });
}

export async function deleteProject(id: string): Promise<ProjectWithCategory> {
  return await prisma.project.delete({
    where: { id },
    include: { category: true },
  });
}
