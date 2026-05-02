import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getAllPages,
  createPage,
} from "@/lib/data/page";

// GET /api/pages - List all pages (public)
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
    };

    const pages = await getAllPages(options);
    return NextResponse.json(pages);
  } catch (error) {
    console.error("GET /api/pages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 500 }
    );
  }
}

// POST /api/pages - Create page (admin/editor only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["admin", "editor"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      content,
      excerpt,
      metaTitle,
      metaDesc,
      isPublished,
      featured,
      layout,
      customCss,
    } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      );
    }

    const page = await createPage({
      title,
      slug,
      content,
      excerpt,
      metaTitle,
      metaDesc,
      isPublished: isPublished ?? false,
      featured: featured ?? false,
      layout: layout || "default",
      customCss,
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error("POST /api/pages error:", error);
    return NextResponse.json(
      { error: "Failed to create page" },
      { status: 500 }
    );
  }
}
