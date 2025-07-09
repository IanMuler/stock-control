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
            orderBy: { date: "desc" },
          })
          .then((movements) =>
            movements.map((m) => ({
              id: m.product.id,
              code: m.product.code,
              name: m.product.name,
              currentStock: m.product.currentStock,
              minStock: m.product.minStock,
              categories: m.product.categories, // Mantener estructura para procesamiento posterior
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
        code: item.code,
        name: item.name,
        currentStock: item.currentStock,
        minStock: item.minStock,
        category: item.categories && item.categories.length > 0 
          ? item.categories.map((cat: any) => cat.category?.name).join(", ") 
          : "-",
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
