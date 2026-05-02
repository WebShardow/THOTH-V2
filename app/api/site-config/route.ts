import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSiteConfig, updateSiteConfig, siteConfigKeys } from "@/lib/data/site-config";
import type { SiteConfig } from "@prisma/client";

// GET /api/site-config - Get site config (public)
export async function GET() {
  try {
    const config = await getSiteConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error("GET /api/site-config error:", error);
    return NextResponse.json(
      { error: "Failed to fetch site config" },
      { status: 500 }
    );
  }
}

// PATCH /api/site-config - Update site config (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const data: Partial<Omit<SiteConfig, "id" | "createdAt" | "updatedAt">> = {};
    for (const key of siteConfigKeys) {
      if (body[key] !== undefined) {
        (data as Record<string, unknown>)[key] = body[key];
      }
    }

    const config = await updateSiteConfig(data);
    return NextResponse.json(config);
  } catch (error) {
    console.error("PATCH /api/site-config error:", error);
    return NextResponse.json(
      { error: "Failed to update site config" },
      { status: 500 }
    );
  }
}
