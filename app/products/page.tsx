"use client"

import { useEffect, useState, useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, Package, Plus, AlertTriangle, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

interface Product {
    id: string
    code: string
    name: string
    description?: string
    unit: string
    minStock: number
    currentStock: number
    isActive: boolean
    createdAt: string
    updatedAt: string
    categories?: Array<{
        category: {
            id: string
            name: string
        }
    }>
    _count: {
        movements: number
    }
}


async function fetchAllProducts(): Promise<Product[]> {
    const response = await fetch("/api/products?includeInactive=true")
    if (!response.ok) {
        throw new Error("Failed to fetch product data")
    }
    return response.json()
}

async function fetchCategories(): Promise<Array<{ id: string; name: string }>> {
    const response = await fetch("/api/categories")
    if (!response.ok) {
        throw new Error("Failed to fetch categories")
    }
    return response.json()
}

function filterProducts(products: Product[], search: string, categoryId: string, includeInactive: boolean): Product[] {
    return products.filter(product => {
        // Filtro por estado activo/inactivo
        if (!includeInactive && !product.isActive) {
            return false
        }

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
            const hasCategory = product.categories?.some(cat => cat.category.id === categoryId)
            if (!hasCategory) {
                return false
            }
        }

        return true
    })
}

export async function toggleProductStatus(id: string, isActive: boolean) {
    const res = await fetch(`/api/products`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive }),
    });

    if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "No se pudo cambiar el estado del producto");
    }
    return res.json();
}

export default function ProductsPage() {
    const [search, setSearch] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [includeInactive, setIncludeInactive] = useState(false)
    const [debouncedSearch, setDebouncedSearch] = useState("")

    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleProductStatus(id, isActive),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
    });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
        }, 300)
        return () => clearTimeout(timer)
    }, [search])

    const { data: allProducts, isLoading, error } = useQuery({
        queryKey: ["products"],
        queryFn: fetchAllProducts,
    })

    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: fetchCategories,
    })

    // Filtrado local con useMemo para optimización
    const filteredProducts = useMemo(() => {
        if (!allProducts) return []
        return filterProducts(allProducts, debouncedSearch, selectedCategory, includeInactive)
    }, [allProducts, debouncedSearch, selectedCategory, includeInactive])

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
                                        {categories?.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="includeInactive"
                                    checked={includeInactive}
                                    onCheckedChange={setIncludeInactive}
                                />
                                <Label htmlFor="includeInactive">Incluir productos inactivos</Label>
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
                                            <TableHead>Categorías</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="text-right">Stock Actual</TableHead>
                                            <TableHead className="text-right">Stock Mínimo</TableHead>
                                            <TableHead>Unidad</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredProducts && filteredProducts.length > 0 &&
                                            filteredProducts.map((product) => {
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
                                                        <TableCell>
                                                            {product.categories && product.categories.length > 0 ? (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {product.categories.map((cat) => (
                                                                        <Badge key={cat.category.id} variant="secondary" className="text-xs">
                                                                            {cat.category.name}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400">Sin categoría</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={product.isActive ? "default" : "secondary"}>
                                                                {product.isActive ? "Activo" : "Inactivo"}
                                                            </Badge>
                                                        </TableCell>
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
                                                                variant={product.isActive ? "destructive" : "default"}
                                                                size="sm"
                                                                className="ml-2"
                                                                onClick={() => deleteMutation.mutate({ id: product.id, isActive: !product.isActive })}
                                                            >
                                                                {product.isActive ? (
                                                                    <>
                                                                        <EyeOff className="h-4 w-4 mr-1" />
                                                                        Desactivar
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Eye className="h-4 w-4 mr-1" />
                                                                        Activar
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                    </TableBody>
                                </Table>

                                {(!filteredProducts || filteredProducts.length === 0) && (
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