import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
        });
        break;
      case "movements":
        if (!startDate || !endDate) {
          return NextResponse.json(
            { error: "Start and end dates are required for movements report" },
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
              id: group.product.id,
              productId: group.product.id,
              code: group.product.code,
              name: group.product.name,
              currentStock: group.product.currentStock,
              minStock: group.product.minStock,
              categories: group.product.categories,
              type: type,
              quantity: Math.abs(netQuantity),
              date: group.lastDate,
              balance: netQuantity, // En agrupado, el balance es la diferencia neta
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
              id: m.id,
              productId: m.product.id,
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
            ...(product && product !== "all" && { id: product }),
          },
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
        });
        break;
      default:
        return NextResponse.json(
          { error: "Invalid report type" },
          { status: 400 }
        );
    }

    const formattedData = {
      products: data.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        code: item.code,
        name: item.name,
        currentStock: item.currentStock,
        minStock: item.minStock,
        category: item.categories && item.categories.length > 0 
          ? item.categories.map((cat: any) => cat.category?.name).join(", ") 
          : "-",
        type: item.type,
        quantity: item.quantity,
        date: item.date,
        balance: item.balance,
      })),
    };

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
