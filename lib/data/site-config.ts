import { prisma } from "@/lib/prisma";
import type { SiteConfig, Prisma } from "@prisma/client";

const defaults: Prisma.SiteConfigCreateInput = {
  id: "default",
  siteName: "THOTH CMS",
  siteTagline: "Modern Headless CMS",
  domain: "",
  language: "th",
  timezone: "Asia/Bangkok",
  logoUrl: "",
  logoAlt: "Logo",
  faviconUrl: "",
  showLogoText: true,
  primaryColor: "#6366f1",
  secondaryColor: "#8b5cf6",
  accentColor: "#f59e0b",
  darkMode: false,
  socialLinks: {},
  seoSettings: {},
  maintenanceMode: false,
};

export async function getSiteConfig(): Promise<SiteConfig> {
  let config = await prisma.siteConfig.findUnique({ where: { id: "default" } });
  if (!config) {
    config = await prisma.siteConfig.create({ data: defaults });
  }
  return config;
}

export async function updateSiteConfig(
  data: Partial<Omit<SiteConfig, "id" | "createdAt" | "updatedAt">>
): Promise<SiteConfig> {
  const config = await prisma.siteConfig.upsert({
    where: { id: "default" },
    update: { ...data, updatedAt: new Date() },
    create: { ...defaults, ...data },
  });
  return config;
}

export const siteConfigKeys = [
  "siteName",
  "siteTagline",
  "domain",
  "language",
  "timezone",
  "logoUrl",
  "logoAlt",
  "faviconUrl",
  "showLogoText",
  "primaryColor",
  "secondaryColor",
  "accentColor",
  "darkMode",
  "socialLinks",
  "seoSettings",
  "analyticsId",
  "customCss",
  "customScripts",
  "maintenanceMode",
] as const;
