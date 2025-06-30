import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const categoryId = searchParams.get("categoryId");
    const includeInactive = searchParams.get("includeInactive") === "true";

    const where: any = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoryId) {
      where.categories = {
        some: {
          categoryId: categoryId,
        },
      };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        categories: {
          include: {
            category: {
              select: { id: true, name: true },
            },
          },
        },
        _count: {
          select: { movements: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { code, name, description, unit, minStock, categoryIds } = body;

    if (!code || !name) {
      return NextResponse.json(
        { error: "Code and name are required" },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { code },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: "Product code already exists" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        code,
        name,
        description: description || "",
        unit: unit || "unidad",
        minStock: minStock || 0,
        currentStock: 0,
        categories: {
          create: categoryIds ? categoryIds.map((categoryId: string) => ({
            categoryId,
          })) : [],
        },
      },
      include: {
        categories: {
          include: {
            category: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, code, name, description, unit, minStock, categoryIds } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    if (!code || !name) {
      return NextResponse.json(
        { error: "Code and name are required" },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findFirst({
      where: {
        code,
        id: { not: id },
      },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: "Product code already exists" },
        { status: 400 }
      );
    }

    const product = await prisma.$transaction(async (tx) => {
      // Eliminar las categorías existentes
      await tx.productCategory.deleteMany({
        where: { productId: id },
      });

      // Actualizar el producto y crear las nuevas relaciones de categorías
      return tx.product.update({
        where: { id },
        data: {
          code,
          name,
          description: description || "",
          unit: unit || "unidad",
          minStock: minStock || 0,
          categories: {
            create: categoryIds ? categoryIds.map((categoryId: string) => ({
              categoryId,
            })) : [],
          },
        },
        include: {
          categories: {
            include: {
              category: {
                select: { id: true, name: true },
              },
            },
          },
        },
      });
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: "isActive must be a boolean value" },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: { isActive },
      include: {
        categories: {
          include: {
            category: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    const action = isActive ? "activated" : "deactivated";
    return NextResponse.json({ 
      message: `Product ${action} successfully`,
      product 
    });
  } catch (error) {
    console.error("Product status update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
