import { prisma } from "@/lib/prisma";

export type StaffMemberInput = {
  slug: string;
  name: string;
  role: string;
  email?: string | null;
  bio?: string;
  avatarUrl?: string | null;
  accentColor?: string;
  githubUrl?: string | null;
  projectUrl?: string | null;
  projectHighlights?: string[];
  sortOrder?: number;
  featured?: boolean;
  skills?: string[];
  repos?: {
    name: string;
    demoUrl?: string | null;
    sourceUrl?: string | null;
    landingUrl?: string | null;
  }[];
};

export async function getAllStaffMembers() {
  return prisma.staffMember.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { repos: true },
  });
}

export async function getStaffMemberById(id: string) {
  return prisma.staffMember.findUnique({ where: { id }, include: { repos: true } });
}

export async function getStaffMemberBySlug(slug: string) {
  return prisma.staffMember.findUnique({ where: { slug }, include: { repos: true } });
}

export async function createStaffMember(data: StaffMemberInput) {
  return prisma.staffMember.create({
    data: {
      slug: data.slug,
      name: data.name,
      role: data.role,
      email: data.email || null,
      bio: data.bio ?? "",
      avatarUrl: data.avatarUrl || null,
      accentColor: data.accentColor ?? "blue",
      githubUrl: data.githubUrl || null,
      projectUrl: data.projectUrl || null,
      projectHighlights: data.projectHighlights ?? [],
      sortOrder: data.sortOrder ?? 0,
      featured: data.featured ?? false,
      skills: data.skills ?? [],
      repos: {
        create: data.repos || [],
      },
    },
  });
}

export async function updateStaffMember(id: string, data: StaffMemberInput) {
  return prisma.staffMember.update({
    where: { id },
    data: {
      slug: data.slug,
      name: data.name,
      role: data.role,
      email: data.email || null,
      bio: data.bio ?? "",
      avatarUrl: data.avatarUrl || null,
      accentColor: data.accentColor ?? "blue",
      githubUrl: data.githubUrl || null,
      projectUrl: data.projectUrl || null,
      projectHighlights: data.projectHighlights ?? [],
      sortOrder: data.sortOrder ?? 0,
      featured: data.featured ?? false,
      skills: data.skills ?? [],
      repos: {
        deleteMany: {},
        create: data.repos || [],
      },
    },
  });
}

export async function deleteStaffMember(id: string) {
  return prisma.staffMember.delete({ where: { id } });
}
