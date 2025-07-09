"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Search, Package, Plus, AlertTriangle, Eye, EyeOff, X, Edit } from "lucide-react"
import { EditProductModal } from "@/components/products/edit-product-modal"

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

interface ProductFormData {
    code: string
    name: string
    description: string
    unit: string
    minStock: number
    categoryIds: string[]
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

function ProductsPageContent() {
    const [search, setSearch] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [includeInactive, setIncludeInactive] = useState(false)
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; product: Product | null; action: 'activate' | 'deactivate' }>({ open: false, product: null, action: 'deactivate' })
    const [newProductDialog, setNewProductDialog] = useState(false)
    const [editProductDialog, setEditProductDialog] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [productFormData, setProductFormData] = useState<ProductFormData>({
        code: "",
        name: "",
        description: "",
        unit: "unidad",
        minStock: 0,
        categoryIds: [],
    })
    const [categorySearch, setCategorySearch] = useState("")

    const queryClient = useQueryClient();
    const { toast } = useToast();
    const searchParams = useSearchParams()

    // Auto-open modal based on URL params
    useEffect(() => {
        const action = searchParams.get('action')
        if (action === 'nuevo') {
            setNewProductDialog(true)
        }
    }, [searchParams])

    const deleteMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleProductStatus(id, isActive),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["products"] })
            const action = variables.isActive ? 'activado' : 'desactivado'
            toast({
                title: "¡Éxito!",
                description: `Producto ${action} correctamente.`,
            })
            setConfirmDialog({ open: false, product: null, action: 'deactivate' })
        },
        onError: () => {
            toast({
                title: "Error",
                description: "No se pudo cambiar el estado del producto.",
                variant: "destructive",
            })
        }
    });

    const createProductMutation = useMutation({
        mutationFn: createProduct,
        onSuccess: () => {
            toast({
                title: "Producto creado",
                description: "El producto se ha agregado correctamente",
            })
            queryClient.invalidateQueries({ queryKey: ["products"] })
            setNewProductDialog(false)
            setProductFormData({
                code: "",
                name: "",
                description: "",
                unit: "unidad",
                minStock: 0,
                categoryIds: [],
            })
            setCategorySearch("")
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        },
    })

    const handleToggleStatus = (product: Product) => {
        const action = product.isActive ? 'deactivate' : 'activate'
        setConfirmDialog({ open: true, product, action })
    }

    const confirmToggleStatus = () => {
        if (confirmDialog.product) {
            deleteMutation.mutate({ 
                id: confirmDialog.product.id, 
                isActive: !confirmDialog.product.isActive 
            })
        }
    }

    const handleCreateProduct = (e: React.FormEvent) => {
        e.preventDefault()
        if (!productFormData.code || !productFormData.name) {
            toast({
                title: "Error de validación",
                description: "El código y el nombre son obligatorios",
                variant: "destructive",
            })
            return
        }
        createProductMutation.mutate(productFormData)
    }

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product)
        setEditProductDialog(true)
    }

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
        return filterProducts(allProducts, search, selectedCategory, includeInactive)
    }, [allProducts, search, selectedCategory, includeInactive])

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
                    <Button onClick={() => setNewProductDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Producto
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
                                    onCheckedChange={(checked) => setIncludeInactive(checked === true)}
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
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => handleEditProduct(product)}
                                                                    title="Editar producto"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant={product.isActive ? "destructive" : "default"}
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => handleToggleStatus(product)}
                                                                    title={product.isActive ? "Desactivar producto" : "Activar producto"}
                                                                >
                                                                    {product.isActive ? (
                                                                        <EyeOff className="h-4 w-4" />
                                                                    ) : (
                                                                        <Eye className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                            </div>
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
            
            <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {confirmDialog.action === 'deactivate' ? 'Desactivar producto' : 'Activar producto'}
                        </DialogTitle>
                        <DialogDescription>
                            {confirmDialog.action === 'deactivate' 
                                ? `¿Estás seguro que deseas desactivar el producto "${confirmDialog.product?.name}"? Este producto no aparecerá en los listados activos.`
                                : `¿Estás seguro que deseas activar el producto "${confirmDialog.product?.name}"?`
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setConfirmDialog({ open: false, product: null, action: 'deactivate' })}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            variant={confirmDialog.action === 'deactivate' ? 'destructive' : 'default'}
                            onClick={confirmToggleStatus}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? 'Procesando...' : (confirmDialog.action === 'deactivate' ? 'Desactivar' : 'Activar')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* New Product Modal */}
            <Dialog open={newProductDialog} onOpenChange={setNewProductDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Nuevo Producto</DialogTitle>
                        <DialogDescription>
                            Ingresa los detalles del nuevo producto
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateProduct} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Código</Label>
                            <Input
                                id="code"
                                value={productFormData.code}
                                onChange={(e) => setProductFormData((prev) => ({ ...prev, code: e.target.value }))}
                                placeholder="Código único del producto"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre</Label>
                            <Input
                                id="name"
                                value={productFormData.name}
                                onChange={(e) => setProductFormData((prev) => ({ ...prev, name: e.target.value }))}
                                placeholder="Nombre del producto"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Input
                                id="description"
                                value={productFormData.description}
                                onChange={(e) => setProductFormData((prev) => ({ ...prev, description: e.target.value }))}
                                placeholder="Descripción opcional"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="unit">Unidad</Label>
                            <Input
                                id="unit"
                                value={productFormData.unit}
                                onChange={(e) => setProductFormData((prev) => ({ ...prev, unit: e.target.value }))}
                                placeholder="Unidad de medida (e.g., unidad, caja, litro)"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="minStock">Stock Mínimo</Label>
                            <Input
                                id="minStock"
                                type="number"
                                value={productFormData.minStock}
                                onChange={(e) => setProductFormData((prev) => ({ ...prev, minStock: Number.parseInt(e.target.value) || 0 }))}
                                placeholder="Stock mínimo para alertas"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Categorías</Label>
                            <div className="space-y-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Buscar categorías..."
                                        value={categorySearch}
                                        onChange={(e) => setCategorySearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <div className="border rounded-md p-3 space-y-2 max-h-32 overflow-y-auto">
                                    {categories && categories.length === 0 ? (
                                        <p className="text-sm text-gray-500">No hay categorías disponibles</p>
                                    ) : (
                                        categories?.filter(category => 
                                            category.name.toLowerCase().includes(categorySearch.toLowerCase())
                                        ).map((category) => (
                                            <div key={category.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`new-category-${category.id}`}
                                                    checked={productFormData.categoryIds.includes(category.id)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setProductFormData((prev) => ({
                                                                ...prev,
                                                                categoryIds: [...prev.categoryIds, category.id]
                                                            }))
                                                        } else {
                                                            setProductFormData((prev) => ({
                                                                ...prev,
                                                                categoryIds: prev.categoryIds.filter(id => id !== category.id)
                                                            }))
                                                        }
                                                    }}
                                                />
                                                <Label
                                                    htmlFor={`new-category-${category.id}`}
                                                    className="text-sm font-normal cursor-pointer"
                                                >
                                                    {category.name}
                                                </Label>
                                            </div>
                                        ))
                                    )}
                                    {categories && categories.length > 0 && categories.filter(category => 
                                        category.name.toLowerCase().includes(categorySearch.toLowerCase())
                                    ).length === 0 && (
                                        <p className="text-sm text-gray-500">No se encontraron categorías</p>
                                    )}
                                </div>
                            </div>
                            {productFormData.categoryIds.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {productFormData.categoryIds.map((categoryId) => {
                                        const category = categories?.find(c => c.id === categoryId)
                                        return category ? (
                                            <Badge key={categoryId} variant="secondary" className="text-xs">
                                                {category.name}
                                                <button
                                                    type="button"
                                                    onClick={() => setProductFormData((prev) => ({
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
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setNewProductDialog(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={createProductMutation.isPending}>
                                {createProductMutation.isPending ? "Guardando..." : "Guardar Producto"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Product Modal */}
            <EditProductModal 
                open={editProductDialog} 
                onOpenChange={setEditProductDialog}
                product={editingProduct}
            />
        </MainLayout >
    )
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProductsPageContent />
        </Suspense>
    )
}