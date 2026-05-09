import { prisma } from "./prisma";

export type MenuItem = {
  id: string;
  label: string;
  url: string;
  order: number;
  isExternal: boolean;
  isVisible: boolean;
  showInNavbar: boolean;
  showInSidebar: boolean;
  showInFooter: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export async function getAllMenuItems(): Promise<MenuItem[]> {
  return await prisma.menuItem.findMany({ orderBy: { order: "asc" } });
}

export async function createMenuItem(data: { label: string; url: string; isExternal?: boolean; showInNavbar?: boolean; showInSidebar?: boolean; showInFooter?: boolean }) {
  const last = await prisma.menuItem.findFirst({ orderBy: { order: "desc" } });
  return await prisma.menuItem.create({
    data: {
      label: data.label,
      url: data.url,
      isExternal: data.isExternal ?? false,
      showInNavbar: data.showInNavbar ?? true,
      showInSidebar: data.showInSidebar ?? false,
      showInFooter: data.showInFooter ?? false,
      order: (last?.order ?? -1) + 1,
    },
  });
}

export async function updateMenuItem(id: string, data: Partial<Omit<MenuItem, "id" | "createdAt" | "updatedAt">>) {
  return await prisma.menuItem.update({ where: { id }, data: { ...data, updatedAt: new Date() } });
}

export async function deleteMenuItem(id: string) {
  return await prisma.menuItem.delete({ where: { id } });
}

export async function reorderMenuItems(ids: string[]) {
  await Promise.all(ids.map((id, index) => prisma.menuItem.update({ where: { id }, data: { order: index } })));
}
