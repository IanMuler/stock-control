"use client"

import { useState, useMemo, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, AlertTriangle, Package, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import { StockInModal, StockOutModal, useStockMovements } from "@/components/stock/stock-movements"
import { ExportExcelButton } from "@/components/ui/export-excel-button"

interface Product {
  id: string
  code: string
  name: string
  description?: string
  unit: string
  currentStock: number
  minStock: number
  category?: {
    name: string
  }
  _count: {
    movements: number
  }
}

interface StockData {
  products: Product[]
  categories: Array<{ id: string; name: string }>
}

async function fetchAllStockData(): Promise<StockData> {
  const response = await fetch("/api/stock")
  if (!response.ok) {
    throw new Error("Failed to fetch stock data")
  }
  return response.json()
}

function filterStockProducts(products: Product[], search: string, categoryId: string, categories: Array<{ id: string; name: string }> = []): Product[] {
  return products.filter(product => {
    // Filtro por búsqueda (código, nombre, descripción)
    if (search) {
      const searchLower = search.toLowerCase()
      const matchesSearch = 
        product.code.toLowerCase().includes(searchLower) ||
        product.name.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower))
      
      if (!matchesSearch) {
        return false
      }
    }

    // Filtro por categoría
    if (categoryId && categoryId !== "all") {
      // Buscar el nombre de la categoría por ID
      const selectedCategory = categories.find(cat => cat.id === categoryId)
      if (!selectedCategory || !product.category || product.category.name !== selectedCategory.name) {
        return false
      }
    }

    return true
  })
}

export default function StockPage() {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("") // Updated default value
  
  const searchParams = useSearchParams()
  const { stockIn, stockOut } = useStockMovements()

  // Auto-open modals based on URL params
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'entrada') {
      stockIn.setOpen(true)
    } else if (action === 'salida') {
      stockOut.setOpen(true)
    }
  }, [searchParams, stockIn, stockOut])

  const { data, isLoading, error } = useQuery({
    queryKey: ["stock"],
    queryFn: fetchAllStockData,
  })

  // Filtrado local con useMemo para optimización
  const filteredProducts = useMemo(() => {
    if (!data?.products) return []
    return filterStockProducts(data.products, search, selectedCategory, data.categories)
  }, [data?.products, search, selectedCategory, data?.categories])


  if (error) {
    return (
      <MainLayout>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Error al cargar los datos de stock</AlertDescription>
        </Alert>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Control de Stock</h1>
          <div className="flex gap-2">
            <Button onClick={() => stockIn.setOpen(true)} className="bg-green-600 hover:bg-green-700">
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Entrada
            </Button>
            <Button onClick={() => stockOut.setOpen(true)} className="bg-red-600 hover:bg-red-700">
              <ArrowDownCircle className="h-4 w-4 mr-2" />
              Salida
            </Button>
            <ExportExcelButton 
              data={filteredProducts}
              type="stock"
              filename={`stock-${new Date().toISOString().split("T")[0]}.xlsx`}
            />
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Busca y filtra productos por nombre, código o categoría</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por código o nombre..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem> {/* Updated value prop */}
                    {data?.categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Stock Actual
            </CardTitle>
            <CardDescription>Vista completa del inventario con alertas de stock mínimo</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-right">Stock Actual</TableHead>
                      <TableHead className="text-right">Stock Mínimo</TableHead>
                      <TableHead className="text-right">Mínimo a Pedir</TableHead>
                      <TableHead>Unidad</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Movimientos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => {
                      const isLowStock = product.currentStock <= product.minStock
                      const isOutOfStock = product.currentStock === 0
                      const minimoAPedir = Math.max(0, product.minStock - product.currentStock)

                      return (
                        <TableRow key={product.id}>
                          <TableCell className="font-mono text-sm">{product.code}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              {product.description && (
                                <div className="text-sm text-gray-500">{product.description}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{product.category?.name || "-"}</TableCell>
                          <TableCell className="text-right font-medium">
                            <span className={isOutOfStock ? "text-red-600" : isLowStock ? "text-orange-600" : ""}>
                              {product.currentStock}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-gray-500">{product.minStock}</TableCell>
                          <TableCell className="text-right font-medium">
                            {minimoAPedir > 0 ? (
                              <span className="text-red-600 font-semibold">{minimoAPedir}</span>
                            ) : (
                              <span className="text-green-600">0</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">{product.unit}</TableCell>
                          <TableCell>
                            {isOutOfStock ? (
                              <Badge variant="destructive">Sin Stock</Badge>
                            ) : isLowStock ? (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                Stock Bajo
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Normal
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-sm text-gray-500">{product._count.movements}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No se encontraron productos</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <StockInModal 
        open={stockIn.open} 
        onOpenChange={stockIn.setOpen} 
      />
      
      <StockOutModal 
        open={stockOut.open} 
        onOpenChange={stockOut.setOpen} 
      />
    </MainLayout>
  )
}
