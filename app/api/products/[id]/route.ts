import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────────────────────────────────
// GET /api/products/[id]  ─ Obtiene un producto
// ─────────────────────────────────────────────────────────────────────────
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
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
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────
// PUT /api/products/[id]  ─ Actualiza un producto
// ─────────────────────────────────────────────────────────────────────────
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const existingProduct = await prisma.product.findFirst({
      where: { code, id: { not: params.id } },
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
        where: { productId: params.id },
      });

      // Actualizar el producto y crear las nuevas relaciones de categorías
      return tx.product.update({
        where: { id: params.id },
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
          _count: {
            select: { movements: true },
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

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/products/[id]  ─ Desactiva (soft-delete) un producto
// ─────────────────────────────────────────────────────────────────────────
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificamos que exista el producto
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Soft-delete: marcamos isActive = false
    const deleted = await prisma.product.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json(deleted); // 200 OK con el registro desactivado
  } catch (error) {
    console.error("Product delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
