"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MainLayout } from "@/components/layout/main-layout"
import { Package, TrendingUp, TrendingDown, AlertTriangle, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalProducts: number
  lowStockProducts: number
  todayMovements: {
    in: number
    out: number
  }
  alerts: Array<{
    id: string
    message: string
    product: {
      name: string
      currentStock: number
      minStock: number
    }
  }>
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch("/api/dashboard/stats")
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats")
  }
  return response.json()
}

export default function DashboardPage() {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
  })

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Error al cargar los datos del dashboard</AlertDescription>
        </Alert>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex space-x-2">
            <Button asChild>
              <Link href="/movements/in">
                <ArrowUpCircle className="h-4 w-4 mr-2" />
                Nueva Entrada
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/movements/out">
                <ArrowDownCircle className="h-4 w-4 mr-2" />
                Nueva Salida
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
              <p className="text-xs text-muted-foreground">Productos activos en el sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats?.lowStockProducts || 0}</div>
              <p className="text-xs text-muted-foreground">Productos con stock mínimo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entradas Hoy</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.todayMovements.in || 0}</div>
              <p className="text-xs text-muted-foreground">Movimientos de entrada</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Salidas Hoy</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.todayMovements.out || 0}</div>
              <p className="text-xs text-muted-foreground">Movimientos de salida</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section */}
        {stats?.alerts && stats.alerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                Alertas de Stock
              </CardTitle>
              <CardDescription>Productos que requieren atención inmediata</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{alert.product.name}</p>
                      <p className="text-sm text-gray-600">
                        Stock actual: {alert.product.currentStock} | Mínimo: {alert.product.minStock}
                      </p>
                    </div>
                    <Badge variant="destructive">Stock Bajo</Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" asChild>
                  <Link href="/stock">Ver todos los productos</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Accede rápidamente a las funciones más utilizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20" asChild>
                <Link href="/products/new" className="flex flex-col">
                  <Package className="h-6 w-6 mb-2" />
                  Nuevo Producto
                </Link>
              </Button>
              <Button variant="outline" className="h-20" asChild>
                <Link href="/stock" className="flex flex-col">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  Ver Stock
                </Link>
              </Button>
              <Button variant="outline" className="h-20" asChild>
                <Link href="/reports" className="flex flex-col">
                  <TrendingDown className="h-6 w-6 mb-2" />
                  Reportes
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
