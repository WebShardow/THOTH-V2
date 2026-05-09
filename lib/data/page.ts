import { prisma } from "@/lib/prisma";
import type { Page, Prisma } from "@prisma/client";

export async function getAllPages(
  options?: {
    published?: boolean;
    featured?: boolean;
  }
): Promise<Page[]> {
  const where: Prisma.PageWhereInput = {};
  
  if (options?.published !== undefined) {
    where.isPublished = options.published;
  }
  if (options?.featured !== undefined) {
    where.featured = options.featured;
  }

  return await prisma.page.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function getPageById(id: string): Promise<Page | null> {
  return await prisma.page.findUnique({ where: { id } });
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  return await prisma.page.findUnique({ where: { slug } });
}

export async function createPage(
  data: Prisma.PageUncheckedCreateInput
): Promise<Page> {
  return await prisma.page.create({ data });
}

export async function updatePage(
  id: string,
  data: Prisma.PageUncheckedUpdateInput
): Promise<Page> {
  return await prisma.page.update({ where: { id }, data });
}

export async function deletePage(id: string): Promise<Page> {
  return await prisma.page.delete({ where: { id } });
}
