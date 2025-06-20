import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parse } from "json2csv";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const category = searchParams.get("category");

    if (!type) {
      return NextResponse.json(
        { error: "Report type is required" },
        { status: 400 }
      );
    }

    let data: any;

    switch (type) {
      case "stock":
        data = await prisma.product.findMany({
          where: {
            isActive: true,
            ...(category && category !== "all" && { categoryId: category }),
          },
          select: {
            code: true,
            name: true,
            currentStock: true,
            minStock: true,
            category: {
              select: { name: true },
            },
          },
        });
        break;
      case "movements":
        if (!startDate || !endDate) {
          return NextResponse.json(
            { error: "Start and end dates are required" },
            { status: 400 }
          );
        }
        data = await prisma.movement
          .findMany({
            where: {
              date: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
              ...(category &&
                category !== "all" && { product: { categoryId: category } }),
            },
            include: {
              product: {
                select: {
                  code: true,
                  name: true,
                  currentStock: true,
                  minStock: true,
                },
              },
            },
          })
          .then((movements) =>
            movements.map((m) => ({
              code: m.product.code,
              name: m.product.name,
              currentStock: m.product.currentStock,
              minStock: m.product.minStock,
              category: m.product.category?.name || "-",
            }))
          );
        break;
      case "lowStock":
        data = await prisma.product.findMany({
          where: {
            isActive: true,
            currentStock: {
              lte: prisma.product.fields.minStock,
            },
            ...(category && category !== "all" && { categoryId: category }),
          },
          select: {
            code: true,
            name: true,
            currentStock: true,
            minStock: true,
            category: {
              select: { name: true },
            },
          },
        });
        break;
      default:
        return NextResponse.json(
          { error: "Invalid report type" },
          { status: 400 }
        );
    }

    const formattedData = data.map((item: any) => ({
      Código: item.code,
      Nombre: item.name,
      "Stock Actual": item.currentStock,
      "Stock Mínimo": item.minStock,
      Categoría: item.category?.name || "-",
    }));

    const csv = parse(formattedData, {
      fields: ["Código", "Nombre", "Stock Actual", "Stock Mínimo", "Categoría"],
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=reporte-${type}.csv`,
      },
    });
  } catch (error) {
    console.error("Report export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
