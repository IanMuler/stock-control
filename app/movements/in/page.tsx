"use client"

import type React from "react"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowUpCircle, Search } from "lucide-react"

interface Product {
  id: string
  code: string
  name: string
  unit: string
  currentStock: number
}

interface MovementFormData {
  productId: string
  quantity: number
  description: string
  date: string
}

async function fetchProducts(): Promise<Product[]> {
  const response = await fetch("/api/products")
  if (!response.ok) throw new Error("Failed to fetch products")
  return response.json()
}

async function createMovement(data: MovementFormData) {
  const response = await fetch("/api/movements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, type: "IN" }),
  })
  if (!response.ok) throw new Error("Failed to create movement")
  return response.json()
}

export default function MovementInPage() {
  const [formData, setFormData] = useState<MovementFormData>({
    productId: "",
    quantity: 0,
    description: "",
    date: new Date().toISOString().split("T")[0],
  })
  const [productSearch, setProductSearch] = useState("")

  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  })

  const mutation = useMutation({
    mutationFn: createMovement,
    onSuccess: () => {
      toast({
        title: "Entrada registrada",
        description: "El movimiento de entrada se registró correctamente",
      })
      queryClient.invalidateQueries({ queryKey: ["stock"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
      router.push("/stock")
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const filteredProducts = products.filter(
    (product) =>
      product.code.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.name.toLowerCase().includes(productSearch.toLowerCase()),
  )

  const selectedProduct = products.find((p) => p.id === formData.productId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.productId || formData.quantity <= 0) {
      toast({
        title: "Error de validación",
        description: "Selecciona un producto y cantidad válida",
        variant: "destructive",
      })
      return
    }
    mutation.mutate(formData)
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-2">
          <ArrowUpCircle className="h-6 w-6 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">Nueva Entrada</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registrar Entrada de Productos</CardTitle>
            <CardDescription>Registra el ingreso de productos al inventario</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Selection */}
              <div className="space-y-2">
                <Label htmlFor="product">Producto</Label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar producto por código o nombre..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={formData.productId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, productId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex justify-between items-center w-full">
                            <span>
                              {product.code} - {product.name}
                            </span>
                            <span className="text-sm text-gray-500 ml-2">
                              Stock: {product.currentStock} {product.unit}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedProduct && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Stock actual:</strong> {selectedProduct.currentStock} {selectedProduct.unit}
                    </p>
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      quantity: Number.parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="Ingresa la cantidad"
                />
                {selectedProduct && formData.quantity > 0 && (
                  <p className="text-sm text-green-600">
                    Nuevo stock: {selectedProduct.currentStock + formData.quantity} {selectedProduct.unit}
                  </p>
                )}
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Motivo de la entrada, proveedor, etc."
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={mutation.isPending || !formData.productId || formData.quantity <= 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {mutation.isPending ? "Registrando..." : "Registrar Entrada"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
