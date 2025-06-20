"use client"

import { useState, useEffect } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouter, useParams } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Package } from "lucide-react"

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
    minStock: number
    categoryId?: string
}

interface ProductFormData {
    code: string
    name: string
    description: string
    unit: string
    minStock: number
    categoryId: string
}

async function fetchCategories(): Promise<Category[]> {
    const response = await fetch("/api/categories")
    if (!response.ok) throw new Error("Failed to fetch categories")
    return response.json()
}

async function fetchProduct(id: string): Promise<Product> {
    const response = await fetch(`/api/products/${id}`)
    if (!response.ok) throw new Error("Failed to fetch product")
    return response.json()
}

async function updateProduct(id: string, data: ProductFormData) {
    const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update product")
    }
    return response.json()
}

export default function EditProductPage() {
    const [formData, setFormData] = useState<ProductFormData>({
        code: "",
        name: "",
        description: "",
        unit: "",
        minStock: 0,
        categoryId: "",
    })

    const router = useRouter()
    const params = useParams()
    const { toast } = useToast()
    const id = params.id as string

    const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
        queryKey: ["categories"],
        queryFn: fetchCategories,
    })

    const { data: product, isLoading: isLoadingProduct } = useQuery({
        queryKey: ["product", id],
        queryFn: () => fetchProduct(id),
    })

    useEffect(() => {
        if (product) {
            setFormData({
                code: product.code,
                name: product.name,
                description: product.description || "",
                unit: product.unit,
                minStock: product.minStock,
                categoryId: product.categoryId || "",
            })
        }
    }, [product])

    const mutation = useMutation({
        mutationFn: (data: ProductFormData) => updateProduct(id, data),
        onSuccess: () => {
            toast({
                title: "Producto actualizado",
                description: "Los cambios se han guardado correctamente",
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

    if (isLoadingProduct || isLoadingCategories) {
        return <div>Cargando...</div>
    }

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center space-x-2">
                    <Package className="h-6 w-6 text-blue-600" />
                    <h1 className="text-2xl font-bold text-gray-900">Editar Producto</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Editar Detalles del Producto</CardTitle>
                        <CardDescription>Modifica los detalles del producto seleccionado</CardDescription>
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
                                <Label htmlFor="category">Categoría</Label>
                                <Select
                                    value={formData.categoryId}
                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => router.back()}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={mutation.isPending}>
                                    {mutation.isPending ? "Guardando..." : "Guardar Cambios"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}