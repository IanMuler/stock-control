import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { exportToExcel, REPORT_CONFIGS } from "@/lib/export-excel";

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
    const movementType = searchParams.get("movementType");
    const product = searchParams.get("product");

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
            ...(category && category !== "all" && {
              categories: {
                some: {
                  categoryId: category,
                },
              },
            }),
            ...(product && product !== "all" && { id: product }),
          },
          select: {
            code: true,
            name: true,
            currentStock: true,
            minStock: true,
            categories: {
              select: {
                category: {
                  select: { name: true },
                },
              },
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
              ...(movementType && movementType !== "all" && {
                type: movementType as "IN" | "OUT",
              }),
              ...(category &&
                category !== "all" && {
                  product: {
                    categories: {
                      some: {
                        categoryId: category,
                      },
                    },
                  },
                }),
              ...(product && product !== "all" && { productId: product }),
            },
            include: {
              product: {
                select: {
                  code: true,
                  name: true,
                  currentStock: true,
                  minStock: true,
                  categories: {
                    select: {
                      category: {
                        select: { name: true },
                      },
                    },
                  },
                },
              },
            },
          })
          .then((movements) =>
            movements.map((m: any) => ({
              code: m.product.code,
              name: m.product.name,
              currentStock: m.product.currentStock,
              minStock: m.product.minStock,
              categories: m.product.categories,
              type: m.type,
            }))
          );
        break;
      case "lowStock":
        // Usar un enfoque más simple: obtener todos los productos y filtrar después
        const allProducts = await prisma.product.findMany({
          where: {
            isActive: true,
            ...(category && category !== "all" && {
              categories: {
                some: {
                  categoryId: category,
                },
              },
            }),
            ...(product && product !== "all" && { id: product }),
          },
          select: {
            code: true,
            name: true,
            currentStock: true,
            minStock: true,
            categories: {
              select: {
                category: {
                  select: { name: true },
                },
              },
            },
          },
        });
        
        // Filtrar productos con stock bajo
        data = allProducts.filter(product => product.currentStock <= product.minStock);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid report type" },
          { status: 400 }
        );
    }

    // Obtener configuración del reporte
    const reportConfig = REPORT_CONFIGS[type as keyof typeof REPORT_CONFIGS];
    if (!reportConfig) {
      return NextResponse.json(
        { error: "Invalid report type" },
        { status: 400 }
      );
    }

    // Generar archivo Excel usando la función reutilizable
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `reporte-${type}-${timestamp}.xlsx`;

    const excelBlob = exportToExcel({
      data,
      columns: reportConfig.columns,
      sheetName: reportConfig.sheetName,
      filename
    });

    // Convertir blob a buffer para NextResponse
    const arrayBuffer = await excelBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
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
