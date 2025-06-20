"use client"

import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Package, Plus, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface Product {
    id: string
    code: string
    name: string
    description?: string
    unit: string
    minStock: number
    currentStock: number
    categoryId?: string | null
    isActive: boolean
    createdAt: string
    updatedAt: string
    category?: {
        id: string
        name: string
    } | null
    _count: {
        movements: number
    }
}


async function fetchProductData(search?: string, category?: string): Promise<Product[]> {
    const params = new URLSearchParams()
    if (search) params.append("search", search)
    if (category && category !== "all") params.append("categoryId", category)

    const response = await fetch(`/api/products?${params.toString()}`)
    if (!response.ok) {
        throw new Error("Failed to fetch product data")
    }
    return response.json()
}

export async function deleteProduct(id: string) {
    const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
    });

    if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "No se pudo eliminar el producto");
    }
    return res.json();
}

export default function ProductsPage() {
    const [search, setSearch] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [debouncedSearch, setDebouncedSearch] = useState("")

    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
    });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
        }, 300)
        return () => clearTimeout(timer)
    }, [search])

    const { data, isLoading, error } = useQuery({
        queryKey: ["products", debouncedSearch, selectedCategory],
        queryFn: () => fetchProductData(debouncedSearch, selectedCategory),
    })

    if (error) {
        return (
            <MainLayout>
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>Error al cargar los datos de productos</AlertDescription>
                </Alert>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
                    <Button asChild>
                        <Link href="/products/new">
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Producto
                        </Link>
                    </Button>
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
                                        <SelectItem value="all">Todas las categorías</SelectItem>
                                        {data && data.length > 0 && data.map((category) => (
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

                {/* Products Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Package className="h-5 w-5 mr-2" />
                            Lista de Productos
                        </CardTitle>
                        <CardDescription>Administra los productos del inventario</CardDescription>
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
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Categoría</TableHead>
                                            <TableHead className="text-right">Stock Actual</TableHead>
                                            <TableHead className="text-right">Stock Mínimo</TableHead>
                                            <TableHead>Unidad</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data && data.length > 0 &&
                                            data.map((product) => {
                                                const isLowStock = product.currentStock <= product.minStock
                                                const isOutOfStock = product.currentStock === 0

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
                                                        <TableCell className="text-sm text-gray-500">{product.unit}</TableCell>
                                                        <TableCell className="text-right flex gap-4">
                                                            <Button variant="outline" size="sm" asChild>
                                                                <Link href={`/products/${product.id}/edit`}>Editar</Link>
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                className="ml-2"
                                                                onClick={() => deleteMutation.mutate(product.id)}
                                                            >
                                                                Eliminar
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                    </TableBody>
                                </Table>

                                {(!data || data.length === 0) && (
                                    <div className="text-center py-8 text-gray-500">No se encontraron productos</div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </MainLayout >
    )
}