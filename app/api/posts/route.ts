import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getAllPosts,
  createPost,
} from "@/lib/data/post";

// GET /api/posts - List all posts (public)
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
      tag: searchParams.get("tag") || undefined,
    };

    const posts = await getAllPosts(options);
    return NextResponse.json(posts);
  } catch (error) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create post (admin/editor only)
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
      coverImage,
      categoryId,
      tags,
      metaTitle,
      metaDesc,
      isPublished,
      featured,
      publishedAt,
    } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Title, slug, and content are required" },
        { status: 400 }
      );
    }

    const post = await createPost({
      title,
      slug,
      content,
      excerpt,
      coverImage,
      categoryId,
      tags: tags || [],
      metaTitle,
      metaDesc,
      isPublished: isPublished ?? false,
      featured: featured ?? false,
      publishedAt: publishedAt ? new Date(publishedAt) : null,
      authorId: session.user.id,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
