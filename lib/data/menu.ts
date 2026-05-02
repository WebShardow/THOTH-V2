import { prisma } from "@/lib/prisma";
import type { MenuItem, Prisma } from "@prisma/client";

export type MenuItemWithChildren = MenuItem & {
  children: MenuItem[];
};

export async function getAllMenuItems(
  options?: {
    location?: string;
    visible?: boolean;
    navbar?: boolean;
    sidebar?: boolean;
    footer?: boolean;
  }
): Promise<MenuItem[]> {
  const where: Prisma.MenuItemWhereInput = {};
  
  if (options?.location) {
    where.location = options.location;
  }
  if (options?.visible !== undefined) {
    where.isVisible = options.visible;
  }
  if (options?.navbar !== undefined) {
    where.showInNavbar = options.navbar;
  }
  if (options?.sidebar !== undefined) {
    where.showInSidebar = options.sidebar;
  }
  if (options?.footer !== undefined) {
    where.showInFooter = options.footer;
  }

  return await prisma.menuItem.findMany({
    where,
    orderBy: { order: "asc" },
  });
}

export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  return await prisma.menuItem.findUnique({ where: { id } });
}

export async function getMenuItemsWithChildren(): Promise<MenuItemWithChildren[]> {
  return await prisma.menuItem.findMany({
    where: { parentId: null, isVisible: true },
    include: {
      children: {
        where: { isVisible: true },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });
}

export async function createMenuItem(
  data: Omit<MenuItem, "id" | "createdAt" | "updatedAt" | "children">
): Promise<MenuItem> {
  const last = await prisma.menuItem.findFirst({
    where: { parentId: data.parentId || null },
    orderBy: { order: "desc" },
  });
  
  return await prisma.menuItem.create({
    data: {
      ...data,
      order: (last?.order ?? -1) + 1,
    },
  });
}

export async function updateMenuItem(
  id: string,
  data: Partial<Omit<MenuItem, "id" | "createdAt" | "updatedAt" | "children">>
): Promise<MenuItem> {
  return await prisma.menuItem.update({ where: { id }, data });
}

export async function deleteMenuItem(id: string): Promise<MenuItem> {
  return await prisma.menuItem.delete({ where: { id } });
}

export async function reorderMenuItems(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map((id, index) =>
      prisma.menuItem.update({ where: { id }, data: { order: index } })
    )
  );
}
