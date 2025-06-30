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

    const categories = await prisma.category.findMany({
      select: { 
        id: true, 
        name: true, 
        description: true,
        createdAt: true,
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Categories fetch error:", error);
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
    const { name, description } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    const existingCategory = await prisma.category.findUnique({
      where: { name: name.trim() },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Ya existe una categoría con este nombre" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || "",
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        _count: {
          select: { products: true }
        }
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Category creation error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
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
    const { id, name, description } = body;

    if (!id) {
      return NextResponse.json(
        { error: "El ID de la categoría es requerido" },
        { status: 400 }
      );
    }

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    const existingCategory = await prisma.category.findFirst({
      where: {
        name: name.trim(),
        id: { not: id },
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Ya existe una categoría con este nombre" },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || "",
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        _count: {
          select: { products: true }
        }
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Category update error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "El ID de la categoría es requerido" },
        { status: 400 }
      );
    }

    const categoryWithProducts = await prisma.category.findUnique({
      where: { id },
      include: { 
        products: true
      }
    });

    if (!categoryWithProducts) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    if (categoryWithProducts.products.length > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar una categoría que tiene productos asignados" },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Categoría eliminada exitosamente" });
  } catch (error) {
    console.error("Category deletion error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
