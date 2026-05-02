import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getAllProjects,
  createProject,
} from "@/lib/data/project";

// GET /api/projects - List all projects (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const options = {
      published: searchParams.has("published")
        ? searchParams.get("published") === "true"
        : undefined,
      featured: searchParams.has("featured")
        ? searchParams.get("featured") === "true"
        : undefined,
      categoryId: searchParams.get("categoryId") || undefined,
    };

    const projects = await getAllProjects(options);
    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create project (admin/editor only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["admin", "editor"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      categoryId,
      thumbnail,
      gallery,
      videoLink,
      projectUrl,
      toolsUsed,
      tags,
      metaTitle,
      metaDesc,
      isPublished,
      featured,
    } = body;

    if (!title || !description || !categoryId) {
      return NextResponse.json(
        { error: "Title, description, and category are required" },
        { status: 400 }
      );
    }

    const project = await createProject({
      title,
      description,
      categoryId,
      thumbnail,
      gallery: gallery || [],
      videoLink,
      projectUrl,
      toolsUsed: toolsUsed || [],
      tags: tags || [],
      metaTitle,
      metaDesc,
      isPublished: isPublished ?? false,
      featured: featured ?? false,
      date: new Date(),
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
