import { prisma } from "./prisma";

export async function getPageBySlug(slug: string) {
  return await prisma.page.findUnique({
    where: { slug },
  });
}

export async function getAllPages() {
  return await prisma.page.findMany({
    orderBy: { createdAt: 'desc' },
  });
}
