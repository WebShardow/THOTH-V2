import { prisma } from "./prisma";
import type { Project as ProjectModel } from "@prisma/client";

export type Project = ProjectModel & {
  category: {
    id: string;
    name: string;
  };
};

export async function getAllProjects(): Promise<Project[]> {
  return await prisma.project.findMany({
    include: { category: true },
    orderBy: { date: "desc" },
  });
}

export async function getProjectById(id: string): Promise<Project | null> {
  return await prisma.project.findUnique({
    where: { id },
    include: { category: true },
  });
}

export async function createProject(data: Omit<ProjectModel, "id" | "createdAt" | "updatedAt">): Promise<Project> {
  return await prisma.project.create({
    data,
    include: { category: true },
  });
}

export async function updateProject(id: string, data: Partial<Omit<ProjectModel, "id" | "createdAt" | "updatedAt">>): Promise<Project> {
  return await prisma.project.update({
    where: { id },
    data,
    include: { category: true },
  });
}

export async function deleteProject(id: string): Promise<Project> {
  return await prisma.project.delete({
    where: { id },
    include: { category: true },
  });
}

