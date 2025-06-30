"use client"

import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Package, X } from "lucide-react"

interface Category {
    id: string
    name: string
}

interface ProductFormData {
    code: string
    name: string
    description: string
    unit: string
    minStock: number
    categoryIds: string[]
}

async function fetchCategories(): Promise<Category[]> {
    const response = await fetch("/api/categories")
    if (!response.ok) throw new Error("Failed to fetch categories")
    return response.json()
}

async function createProduct(data: ProductFormData) {
    const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create product")
    }
    return response.json()
}

export default function NewProductPage() {
    const [formData, setFormData] = useState<ProductFormData>({
        code: "",
        name: "",
        description: "",
        unit: "unidad",
        minStock: 0,
        categoryIds: [],
    })

    const router = useRouter()
    const { toast } = useToast()

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: fetchCategories,
    })

    const mutation = useMutation({
        mutationFn: createProduct,
        onSuccess: () => {
            toast({
                title: "Producto creado",
                description: "El producto se ha agregado correctamente",
            })
            router.push("/products")
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        },
    })

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

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center space-x-2">
                    <Package className="h-6 w-6 text-blue-600" />
                    <h1 className="text-2xl font-bold text-gray-900">Nuevo Producto</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Agregar Nuevo Producto</CardTitle>
                        <CardDescription>Ingresa los detalles del nuevo producto</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="code">Código</Label>
                                <Input
                                    id="code"
                                    value={formData.code}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                                    placeholder="Código único del producto"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                    placeholder="Nombre del producto"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                    placeholder="Descripción opcional"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="unit">Unidad</Label>
                                <Input
                                    id="unit"
                                    value={formData.unit}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
                                    placeholder="Unidad de medida (e.g., unidad, caja, litro)"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="minStock">Stock Mínimo</Label>
                                <Input
                                    id="minStock"
                                    type="number"
                                    value={formData.minStock}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, minStock: Number.parseInt(e.target.value) || 0 }))}
                                    placeholder="Stock mínimo para alertas"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Categorías</Label>
                                <div className="border rounded-md p-3 space-y-2">
                                    {categories.length === 0 ? (
                                        <p className="text-sm text-gray-500">No hay categorías disponibles</p>
                                    ) : (
                                        categories.map((category) => (
                                            <div key={category.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`category-${category.id}`}
                                                    checked={formData.categoryIds.includes(category.id)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                categoryIds: [...prev.categoryIds, category.id]
                                                            }))
                                                        } else {
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                categoryIds: prev.categoryIds.filter(id => id !== category.id)
                                                            }))
                                                        }
                                                    }}
                                                />
                                                <Label
                                                    htmlFor={`category-${category.id}`}
                                                    className="text-sm font-normal cursor-pointer"
                                                >
                                                    {category.name}
                                                </Label>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {formData.categoryIds.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {formData.categoryIds.map((categoryId) => {
                                            const category = categories.find(c => c.id === categoryId)
                                            return category ? (
                                                <Badge key={categoryId} variant="secondary" className="text-xs">
                                                    {category.name}
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData((prev) => ({
                                                            ...prev,
                                                            categoryIds: prev.categoryIds.filter(id => id !== categoryId)
                                                        }))}
                                                        className="ml-1 text-gray-500 hover:text-gray-700"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ) : null
                                        })}
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => router.back()}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={mutation.isPending}>
                                    {mutation.isPending ? "Guardando..." : "Guardar Producto"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}