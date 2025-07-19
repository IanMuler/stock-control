"use client"

import { useState, useMemo, useRef } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ArrowDownCircle } from "lucide-react"
import { CategorySelector } from "@/components/ui/category-selector"

interface Product {
  id: string
  code: string
  name: string
  unit: string
  currentStock: number
  categories?: Array<{
    category: {
      id: string
      name: string
    }
  }>
}

interface MovementFormData {
  productId: string
  quantity: number
  description: string
  date: string
}

interface StockOutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

async function fetchProducts(categoryId?: string): Promise<Product[]> {
  const params = new URLSearchParams()
  if (categoryId && categoryId !== "all") {
    params.append("categoryId", categoryId)
  }
  
  const url = `/api/products${params.toString() ? `?${params.toString()}` : ""}`
  const response = await fetch(url)
  if (!response.ok) throw new Error("Failed to fetch products")
  return response.json()
}

async function createStockOutMovement(data: MovementFormData) {
  const response = await fetch("/api/movements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, type: "OUT" }),
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to create movement")
  }
  return response.json()
}

export function StockOutModal({ open, onOpenChange }: StockOutModalProps) {
  const [formData, setFormData] = useState<MovementFormData>({
    productId: "",
    quantity: 0,
    description: "",
    date: new Date().toISOString().split("T")[0],
  })
  const [productSearch, setProductSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectOpen, setSelectOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: products = [] } = useQuery({
    queryKey: ["products", selectedCategory],
    queryFn: () => fetchProducts(selectedCategory),
  })

  const mutation = useMutation({
    mutationFn: createStockOutMovement,
    onSuccess: () => {
      toast({
        title: "Salida registrada",
        description: "El movimiento de salida se registró correctamente",
      })
      queryClient.invalidateQueries({ queryKey: ["stock"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
      onOpenChange(false)
      setFormData({
        productId: "",
        quantity: 0,
        description: "",
        date: new Date().toISOString().split("T")[0],
      })
      setProductSearch("")
      setSelectedCategory("all")
      setSelectOpen(false)
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const filteredProducts = useMemo(() => {
    let filtered = products
    
    // Filtrar por búsqueda de texto
    if (productSearch) {
      filtered = filtered.filter(
        (product) =>
          product.code.toLowerCase().includes(productSearch.toLowerCase()) ||
          product.name.toLowerCase().includes(productSearch.toLowerCase())
      )
    }
    
    return filtered
  }, [products, productSearch])

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
    if (selectedProduct && formData.quantity > selectedProduct.currentStock) {
      toast({
        title: "Error de validación",
        description: "La cantidad de salida no puede ser mayor al stock actual",
        variant: "destructive",
      })
      return
    }
    mutation.mutate(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowDownCircle className="h-5 w-5 text-red-600" />
            Nueva Salida
          </DialogTitle>
          <DialogDescription>
            Registra la salida de productos del inventario
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Filtrar por categoría</Label>
            <CategorySelector
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              placeholder="Todas las categorías"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-search-out">Producto</Label>
            <div className="space-y-2 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  ref={searchInputRef}
                  placeholder="Buscar producto por código o nombre..."
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value)
                    setSelectOpen(e.target.value.length > 0)
                  }}
                  onFocus={() => setSelectOpen(productSearch.length > 0)}
                  className="pl-10"
                />
                
                {/* Lista de productos filtrados flotante */}
                {selectOpen && filteredProducts.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 border rounded-md max-h-48 overflow-y-auto bg-white shadow-lg">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, productId: product.id }))
                          setSelectOpen(false)
                          setProductSearch("")
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm">
                            {product.code} - {product.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            Stock: {product.currentStock} {product.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Select oculto para mostrar el producto seleccionado */}
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
                      {product.code} - {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedProduct && (
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-800">
                  <strong>Stock actual:</strong> {selectedProduct.currentStock} {selectedProduct.unit}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity-out">Cantidad</Label>
            <Input
              id="quantity-out"
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
            />
            {selectedProduct && formData.quantity > 0 && (
              <p className="text-sm text-red-600">
                Nuevo stock: {selectedProduct.currentStock - formData.quantity} {selectedProduct.unit}
              </p>
            )}
            {selectedProduct && formData.quantity > selectedProduct.currentStock && (
              <p className="text-sm text-red-600 font-medium">
                ⚠️ La cantidad no puede ser mayor al stock actual
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-out">Fecha</Label>
            <Input
              id="date-out"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description-out">Descripción (opcional)</Label>
            <Textarea
              id="description-out"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Motivo de la salida, destino, etc."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                mutation.isPending || 
                !formData.productId || 
                formData.quantity <= 0 ||
                (selectedProduct && formData.quantity > selectedProduct.currentStock)
              }
              className="bg-red-600 hover:bg-red-700"
            >
              {mutation.isPending ? "Registrando..." : "Registrar Salida"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}