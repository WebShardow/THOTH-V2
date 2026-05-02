import { prisma } from "@/lib/prisma";
import type { Post, Category, Prisma } from "@prisma/client";

export type PostWithCategory = Post & {
  category: Category | null;
};

export async function getAllPosts(
  options?: {
    published?: boolean;
    featured?: boolean;
    categoryId?: string;
    tag?: string;
  }
): Promise<PostWithCategory[]> {
  const where: Prisma.PostWhereInput = {};
  
  if (options?.published !== undefined) {
    where.isPublished = options.published;
  }
  if (options?.featured !== undefined) {
    where.featured = options.featured;
  }
  if (options?.categoryId) {
    where.categoryId = options.categoryId;
  }
  if (options?.tag) {
    where.tags = { has: options.tag };
  }

  return await prisma.post.findMany({
    where,
    include: { category: true },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getPostById(id: string): Promise<PostWithCategory | null> {
  return await prisma.post.findUnique({
    where: { id },
    include: { category: true },
  });
}

export async function getPostBySlug(slug: string): Promise<PostWithCategory | null> {
  return await prisma.post.findUnique({
    where: { slug },
    include: { category: true },
  });
}

export async function createPost(
  data: Omit<Post, "id" | "createdAt" | "updatedAt">
): Promise<PostWithCategory> {
  return await prisma.post.create({
    data,
    include: { category: true },
  });
}

export async function updatePost(
  id: string,
  data: Partial<Omit<Post, "id" | "createdAt" | "updatedAt">>
): Promise<PostWithCategory> {
  return await prisma.post.update({
    where: { id },
    data,
    include: { category: true },
  });
}

export async function deletePost(id: string): Promise<PostWithCategory> {
  return await prisma.post.delete({
    where: { id },
    include: { category: true },
  });
}
