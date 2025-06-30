"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MainLayout } from "@/components/layout/main-layout"
import { Plus, Edit, Trash2, AlertTriangle, Package } from "lucide-react"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
  description: string | null
  createdAt: string
  _count: {
    products: number
  }
}

interface CategoryFormData {
  name: string
  description: string
}

async function fetchCategories(): Promise<Category[]> {
  const response = await fetch("/api/categories")
  if (!response.ok) {
    throw new Error("Error al cargar las categorías")
  }
  return response.json()
}

async function createCategory(data: CategoryFormData): Promise<Category> {
  const response = await fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Error al crear la categoría")
  }
  return response.json()
}

async function updateCategory(id: string, data: CategoryFormData): Promise<Category> {
  const response = await fetch("/api/categories", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...data }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Error al actualizar la categoría")
  }
  return response.json()
}

async function deleteCategory(id: string): Promise<void> {
  const response = await fetch("/api/categories", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Error al eliminar la categoría")
  }
}

export default function CategoriasPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({ name: "", description: "" })

  const queryClient = useQueryClient()

  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  })

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      setIsCreateDialogOpen(false)
      setFormData({ name: "", description: "" })
      toast.success("Categoría creada exitosamente")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormData }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      setIsEditDialogOpen(false)
      setEditingCategory(null)
      setFormData({ name: "", description: "" })
      toast.success("Categoría actualizada exitosamente")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast.success("Categoría eliminada exitosamente")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (category: Category) => {
    if (category._count.products > 0) {
      toast.error("No se puede eliminar una categoría que tiene productos asignados")
      return
    }
    
    if (confirm(`¿Estás seguro de que deseas eliminar la categoría "${category.name}"?`)) {
      deleteMutation.mutate(category.id)
    }
  }

  const resetForm = () => {
    setFormData({ name: "", description: "" })
    setEditingCategory(null)
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Error al cargar las categorías</AlertDescription>
        </Alert>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <Dialog 
            open={isCreateDialogOpen} 
            onOpenChange={(open) => {
              setIsCreateDialogOpen(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Categoría
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Categoría</DialogTitle>
                <DialogDescription>
                  Completa la información para crear una nueva categoría.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Nombre de la categoría"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Descripción de la categoría (opcional)"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Creando..." : "Crear Categoría"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Lista de Categorías
            </CardTitle>
            <CardDescription>
              Gestiona las categorías de productos del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!categories || categories.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay categorías registradas</p>
                <p className="text-sm text-gray-400">
                  Crea tu primera categoría para organizar tus productos
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead>Fecha de Creación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-gray-600">
                        {category.description || "Sin descripción"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {category._count.products} productos
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(category.createdAt).toLocaleDateString("es-ES")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(category)}
                            disabled={category._count.products > 0 || deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog 
          open={isEditDialogOpen} 
          onOpenChange={(open) => {
            setIsEditDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Categoría</DialogTitle>
              <DialogDescription>
                Modifica la información de la categoría.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Nombre *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Nombre de la categoría"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Descripción</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Descripción de la categoría (opcional)"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Actualizando..." : "Actualizar Categoría"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}