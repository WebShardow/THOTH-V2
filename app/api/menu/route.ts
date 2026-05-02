import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getAllMenuItems,
  getMenuItemsWithChildren,
  createMenuItem,
  reorderMenuItems,
} from "@/lib/data/menu";

// GET /api/menu - List all menu items (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    if (searchParams.get("hierarchical") === "true") {
      const items = await getMenuItemsWithChildren();
      return NextResponse.json(items);
    }

    const options = {
      location: searchParams.get("location") || undefined,
      visible: searchParams.has("visible")
        ? searchParams.get("visible") === "true"
        : undefined,
      navbar: searchParams.has("navbar")
        ? searchParams.get("navbar") === "true"
        : undefined,
      sidebar: searchParams.has("sidebar")
        ? searchParams.get("sidebar") === "true"
        : undefined,
      footer: searchParams.has("footer")
        ? searchParams.get("footer") === "true"
        : undefined,
    };

    const items = await getAllMenuItems(options);
    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/menu error:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}

// POST /api/menu - Create menu item (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      label,
      url,
      icon,
      parentId,
      isExternal,
      isVisible,
      showInNavbar,
      showInSidebar,
      showInFooter,
      location,
    } = body;

    if (!label || !url) {
      return NextResponse.json(
        { error: "Label and URL are required" },
        { status: 400 }
      );
    }

    const item = await createMenuItem({
      label,
      url,
      icon,
      parentId,
      isExternal: isExternal ?? false,
      isVisible: isVisible ?? true,
      showInNavbar: showInNavbar ?? true,
      showInSidebar: showInSidebar ?? false,
      showInFooter: showInFooter ?? false,
      location: location || "main",
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("POST /api/menu error:", error);
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}

// PATCH /api/menu/reorder - Reorder menu items (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids)) {
      return NextResponse.json(
        { error: "IDs array is required" },
        { status: 400 }
      );
    }

    await reorderMenuItems(ids);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/menu error:", error);
    return NextResponse.json(
      { error: "Failed to reorder menu items" },
      { status: 500 }
    );
  }
}
