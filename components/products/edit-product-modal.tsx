"use client"

import { useState, useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Package, X, Search } from "lucide-react"
import { CategoryMultiSelector } from "@/components/ui/category-multi-selector"

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  code: string
  name: string
  description?: string
  unit: string
  currentStock?: number
  minStock: number
  categories?: Array<{
    category: {
      id: string
      name: string
    }
  }>
  _count?: {
    movements: number
  }
}

interface ProductFormData {
  code: string
  name: string
  description: string
  unit: string
  minStock: number
  categoryIds: string[]
}

interface EditProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
}

async function fetchCategories(): Promise<Category[]> {
  const response = await fetch("/api/categories")
  if (!response.ok) throw new Error("Failed to fetch categories")
  return response.json()
}

async function updateProduct(id: string, data: ProductFormData) {
  const response = await fetch("/api/products", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...data }),
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to update product")
  }
  return response.json()
}

export function EditProductModal({ open, onOpenChange, product }: EditProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    code: "",
    name: "",
    description: "",
    unit: "unidad",
    minStock: 0,
    categoryIds: [],
  })
  const [categorySearch, setCategorySearch] = useState("")

  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  })

  const mutation = useMutation({
    mutationFn: (data: ProductFormData) => updateProduct(product!.id, data),
    onSuccess: () => {
      toast({
        title: "Producto actualizado",
        description: "El producto se ha actualizado correctamente",
      })
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["stock"] })
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Llenar formulario cuando se carga el producto
  useEffect(() => {
    if (product) {
      setFormData({
        code: product.code,
        name: product.name,
        description: product.description || "",
        unit: product.unit,
        minStock: product.minStock,
        categoryIds: product.categories?.map(cat => cat.category.id) || [],
      })
    }
  }, [product])

  // Resetear formulario cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      setFormData({
        code: "",
        name: "",
        description: "",
        unit: "unidad",
        minStock: 0,
        categoryIds: [],
      })
      setCategorySearch("")
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.code || !formData.name) {
      toast({
        title: "Error de validación",
        description: "El código y el nombre son obligatorios",
        variant: "destructive",
      })
      return
    }
    mutation.mutate(formData)
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Editar Producto
          </DialogTitle>
          <DialogDescription>
            Modifica los detalles del producto
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-code">Código</Label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                placeholder="Código único del producto"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre del producto"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción opcional"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-unit">Unidad</Label>
              <Input
                id="edit-unit"
                value={formData.unit}
                onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
                placeholder="Unidad de medida (e.g., unidad, caja, litro)"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-minStock">Stock Mínimo</Label>
              <Input
                id="edit-minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData((prev) => ({ ...prev, minStock: Number.parseInt(e.target.value) || 0 }))}
                placeholder="Stock mínimo para alertas"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Categorías</Label>
              <CategoryMultiSelector
                value={formData.categoryIds}
                onValueChange={(categoryIds) => 
                  setFormData((prev) => ({ ...prev, categoryIds }))
                }
                placeholder="Seleccionar categorías..."
                maxHeight="150px"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Actualizando..." : "Actualizar Producto"}
              </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}