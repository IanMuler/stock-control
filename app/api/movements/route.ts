import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { productId, quantity, description, date, type } = body

    if (!productId || !quantity || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (quantity <= 0) {
      return NextResponse.json({ error: "Quantity must be positive" }, { status: 400 })
    }

    // Get current product stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Validate stock for OUT movements
    if (type === "OUT" && product.currentStock < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
    }

    // Calculate new stock
    const newStock = type === "IN" ? product.currentStock + quantity : product.currentStock - quantity

    // Create movement and update stock in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create movement
      const movement = await tx.movement.create({
        data: {
          type,
          quantity,
          description: description || "",
          date: new Date(date),
          productId,
          userId: session.user.id,
        },
        include: {
          product: {
            select: { name: true, code: true },
          },
          user: {
            select: { name: true, email: true },
          },
        },
      })

      // Update product stock
      await tx.product.update({
        where: { id: productId },
        data: { currentStock: newStock },
      })

      // Create alert if stock is low after OUT movement
      if (type === "OUT" && newStock <= product.minStock && newStock > 0) {
        await tx.alert.create({
          data: {
            type: "LOW_STOCK",
            message: `${product.name} tiene stock bajo (${newStock} unidades)`,
            productId: productId,
          },
        })
      }

      // Create alert if out of stock
      if (type === "OUT" && newStock === 0) {
        await tx.alert.create({
          data: {
            type: "OUT_OF_STOCK",
            message: `${product.name} está sin stock`,
            productId: productId,
          },
        })
      }

      return movement
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Movement creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")
    const type = searchParams.get("type")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const where: any = {}

    if (productId) where.productId = productId
    if (type) where.type = type

    const movements = await prisma.movement.findMany({
      where,
      include: {
        product: {
          select: { name: true, code: true, unit: true },
        },
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    })

    const total = await prisma.movement.count({ where })

    return NextResponse.json({
      movements,
      total,
      hasMore: offset + limit < total,
    })
  } catch (error) {
    console.error("Movements fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
