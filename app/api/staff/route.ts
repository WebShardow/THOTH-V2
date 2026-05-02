import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getAllStaff,
  createStaff,
} from "@/lib/data/staff";

// GET /api/staff - List all staff members (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const options = {
      featured: searchParams.has("featured")
        ? searchParams.get("featured") === "true"
        : undefined,
      active: searchParams.has("active")
        ? searchParams.get("active") === "true"
        : undefined,
    };

    const staff = await getAllStaff(options);
    return NextResponse.json(staff);
  } catch (error) {
    console.error("GET /api/staff error:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff members" },
      { status: 500 }
    );
  }
}

// POST /api/staff - Create staff member (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      role,
      email,
      bio,
      avatarUrl,
      accentColor,
      githubUrl,
      linkedinUrl,
      twitterUrl,
      websiteUrl,
      projectHighlights,
      skills,
      sortOrder,
      featured,
      isActive,
    } = body;

    if (!name || !slug || !role) {
      return NextResponse.json(
        { error: "Name, slug, and role are required" },
        { status: 400 }
      );
    }

    const staff = await createStaff({
      name,
      slug,
      role,
      email,
      bio,
      avatarUrl,
      accentColor: accentColor || "indigo",
      githubUrl,
      linkedinUrl,
      twitterUrl,
      websiteUrl,
      projectHighlights: projectHighlights || [],
      skills: skills || [],
      sortOrder: sortOrder || 0,
      featured: featured ?? false,
      isActive: isActive ?? true,
    });

    return NextResponse.json(staff, { status: 201 });
  } catch (error) {
    console.error("POST /api/staff error:", error);
    return NextResponse.json(
      { error: "Failed to create staff member" },
      { status: 500 }
    );
  }
}
