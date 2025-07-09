import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
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
    const groupByProduct = searchParams.get("groupByProduct") === "true";

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
        const movements = await prisma.movement.findMany({
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
                id: true,
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
          orderBy: [
            { date: "desc" },
            { createdAt: "desc" },
            { productId: "asc" },
          ],
        });

        if (groupByProduct) {
          // Agrupar movimientos por producto
          const productGroups: Record<string, any> = {};
          
          movements.forEach((m: any) => {
            const productId = m.product.id;
            
            if (!productGroups[productId]) {
              productGroups[productId] = {
                product: m.product,
                totalIN: 0,
                totalOUT: 0,
                lastDate: m.date,
                movementCount: 0
              };
            }
            
            // Acumular cantidades por tipo
            if (m.type === "IN") {
              productGroups[productId].totalIN += m.quantity;
            } else if (m.type === "OUT") {
              productGroups[productId].totalOUT += m.quantity;
            }
            
            productGroups[productId].movementCount++;
            
            // Mantener la fecha más reciente
            if (new Date(m.date) > new Date(productGroups[productId].lastDate)) {
              productGroups[productId].lastDate = m.date;
            }
          });
          
          // Convertir a array y crear registros agrupados
          data = Object.values(productGroups).map((group: any) => {
            const netQuantity = group.totalIN - group.totalOUT;
            const type = netQuantity > 0 ? "IN" : netQuantity < 0 ? "OUT" : "NEUTRAL";
            
            return {
              code: group.product.code,
              name: group.product.name,
              currentStock: group.product.currentStock,
              minStock: group.product.minStock,
              categories: group.product.categories,
              type: type,
              quantity: Math.abs(netQuantity),
              date: group.lastDate,
              balance: netQuantity,
            };
          });
        } else {
          // Lógica original con saldo corriente
          const productBalances: Record<string, number> = {};
          
          data = movements.map((m: any) => {
            const productId = m.product.id;
            
            // Inicializar saldo si no existe
            if (!productBalances[productId]) {
              productBalances[productId] = 0;
            }
            
            // Actualizar saldo según tipo de movimiento
            if (m.type === "IN") {
              productBalances[productId] += m.quantity;
            } else if (m.type === "OUT") {
              productBalances[productId] -= m.quantity;
            }
            
            return {
              code: m.product.code,
              name: m.product.name,
              currentStock: m.product.currentStock,
              minStock: m.product.minStock,
              categories: m.product.categories,
              type: m.type,
              quantity: m.quantity,
              date: m.date,
              balance: productBalances[productId],
            };
          });
        }
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
