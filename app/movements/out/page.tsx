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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { ArrowDownCircle, Search, AlertTriangle } from "lucide-react"

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
    body: JSON.stringify({ ...data, type: "OUT" }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to create movement")
  }
  return response.json()
}

export default function MovementOutPage() {
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
        title: "Salida registrada",
        description: "El movimiento de salida se registró correctamente",
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
  const hasInsufficientStock = selectedProduct && formData.quantity > selectedProduct.currentStock
  const newStock = selectedProduct ? selectedProduct.currentStock - formData.quantity : 0

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
    if (hasInsufficientStock) {
      toast({
        title: "Stock insuficiente",
        description: "La cantidad solicitada excede el stock disponible",
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
          <ArrowDownCircle className="h-6 w-6 text-red-600" />
          <h1 className="text-2xl font-bold text-gray-900">Nueva Salida</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registrar Salida de Productos</CardTitle>
            <CardDescription>Registra la salida de productos del inventario</CardDescription>
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
                            <span
                              className={`text-sm ml-2 ${
                                product.currentStock === 0
                                  ? "text-red-500"
                                  : product.currentStock <= 5
                                    ? "text-orange-500"
                                    : "text-gray-500"
                              }`}
                            >
                              Stock: {product.currentStock} {product.unit}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedProduct && (
                  <div
                    className={`p-3 rounded-lg border ${
                      selectedProduct.currentStock === 0
                        ? "bg-red-50 border-red-200"
                        : selectedProduct.currentStock <= 5
                          ? "bg-orange-50 border-orange-200"
                          : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        selectedProduct.currentStock === 0
                          ? "text-red-800"
                          : selectedProduct.currentStock <= 5
                            ? "text-orange-800"
                            : "text-blue-800"
                      }`}
                    >
                      <strong>Stock disponible:</strong> {selectedProduct.currentStock} {selectedProduct.unit}
                      {selectedProduct.currentStock === 0 && " - Sin stock disponible"}
                      {selectedProduct.currentStock <= 5 && selectedProduct.currentStock > 0 && " - Stock bajo"}
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
                  max={selectedProduct?.currentStock || undefined}
                  value={formData.quantity || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      quantity: Number.parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="Ingresa la cantidad"
                  disabled={selectedProduct?.currentStock === 0}
                />
                {selectedProduct && formData.quantity > 0 && (
                  <div className="space-y-2">
                    {hasInsufficientStock ? (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Stock insuficiente. Disponible: {selectedProduct.currentStock} {selectedProduct.unit}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <p className={`text-sm ${newStock <= 5 ? "text-orange-600" : "text-gray-600"}`}>
                        Stock después de la salida: {newStock} {selectedProduct.unit}
                        {newStock <= 5 && newStock > 0 && " (Stock bajo)"}
                        {newStock === 0 && " (Sin stock)"}
                      </p>
                    )}
                  </div>
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
                  placeholder="Motivo de la salida, destino, etc."
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
                  disabled={
                    mutation.isPending ||
                    !formData.productId ||
                    formData.quantity <= 0 ||
                    hasInsufficientStock ||
                    selectedProduct?.currentStock === 0
                  }
                  className="bg-red-600 hover:bg-red-700"
                >
                  {mutation.isPending ? "Registrando..." : "Registrar Salida"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
