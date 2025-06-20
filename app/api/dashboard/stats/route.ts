import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get total products
    const totalProducts = await prisma.product.count({
      where: { isActive: true },
    })

    // Get products with low stock
    const lowStockProducts = await prisma.product.count({
      where: {
        isActive: true,
        currentStock: {
          lte: prisma.product.fields.minStock,
        },
      },
    })

    // Get today's movements
    const todayMovements = await prisma.movement.groupBy({
      by: ["type"],
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      _sum: {
        quantity: true,
      },
    })

    const movementStats = {
      in: todayMovements.find((m) => m.type === "IN")?._sum.quantity || 0,
      out: todayMovements.find((m) => m.type === "OUT")?._sum.quantity || 0,
    }

    // Get alerts for low stock products
    const alerts = await prisma.product.findMany({
      where: {
        isActive: true,
        currentStock: {
          lte: prisma.product.fields.minStock,
        },
      },
      select: {
        id: true,
        name: true,
        currentStock: true,
        minStock: true,
      },
      take: 5,
    })

    const formattedAlerts = alerts.map((product) => ({
      id: product.id,
      message: `${product.name} tiene stock bajo`,
      product: {
        name: product.name,
        currentStock: product.currentStock,
        minStock: product.minStock,
      },
    }))

    return NextResponse.json({
      totalProducts,
      lowStockProducts,
      todayMovements: movementStats,
      alerts: formattedAlerts,
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
