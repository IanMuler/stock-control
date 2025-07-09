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
            movements.map((m) => ({
              code: m.product.code,
              name: m.product.name,
              currentStock: m.product.currentStock,
              minStock: m.product.minStock,
              categories: m.product.categories,
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
            ...(category && category !== "all" && {
              categories: {
                some: {
                  categoryId: category,
                },
              },
            }),
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
