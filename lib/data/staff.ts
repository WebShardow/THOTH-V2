import { prisma } from "@/lib/prisma";
import type { StaffMember, Prisma } from "@prisma/client";

export async function getAllStaff(
  options?: {
    featured?: boolean;
    active?: boolean;
  }
): Promise<StaffMember[]> {
  const where: Prisma.StaffMemberWhereInput = {};
  
  if (options?.featured !== undefined) {
    where.featured = options.featured;
  }
  if (options?.active !== undefined) {
    where.isActive = options.active;
  }

  return await prisma.staffMember.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getStaffById(id: string): Promise<StaffMember | null> {
  return await prisma.staffMember.findUnique({ where: { id } });
}

export async function getStaffBySlug(slug: string): Promise<StaffMember | null> {
  return await prisma.staffMember.findUnique({ where: { slug } });
}

export async function createStaff(
  data: Omit<StaffMember, "id" | "createdAt" | "updatedAt">
): Promise<StaffMember> {
  return await prisma.staffMember.create({ data });
}

export async function updateStaff(
  id: string,
  data: Partial<Omit<StaffMember, "id" | "createdAt" | "updatedAt">>
): Promise<StaffMember> {
  return await prisma.staffMember.update({ where: { id }, data });
}

export async function deleteStaff(id: string): Promise<StaffMember> {
  return await prisma.staffMember.delete({ where: { id } });
}

export async function reorderStaff(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map((id, index) =>
      prisma.staffMember.update({ where: { id }, data: { sortOrder: index } })
    )
  );
}
