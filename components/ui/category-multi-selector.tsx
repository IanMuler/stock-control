"use client"

import { useState, useMemo } from "react"
import { Search, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCategories, type Category } from "@/hooks/useCategories"

interface CategoryMultiSelectorProps {
  value?: string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  className?: string
  maxHeight?: string
}

export function CategoryMultiSelector({
  value = [],
  onValueChange,
  placeholder = "Seleccionar categorías...",
  searchPlaceholder = "Buscar categorías...",
  disabled = false,
  className,
  maxHeight = "200px",
}: CategoryMultiSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const { data: categories = [], isLoading } = useCategories()

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories
    
    return categories.filter((category: Category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [categories, searchTerm])

  const selectedCategories = useMemo(() => {
    return categories.filter((category: Category) => value.includes(category.id))
  }, [categories, value])

  const handleToggleCategory = (categoryId: string) => {
    if (disabled) return

    const newValue = value.includes(categoryId)
      ? value.filter(id => id !== categoryId)
      : [...value, categoryId]
    
    onValueChange?.(newValue)
  }

  const handleRemoveCategory = (categoryId: string) => {
    if (disabled) return
    
    const newValue = value.filter(id => id !== categoryId)
    onValueChange?.(newValue)
  }

  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          disabled={disabled}
        />
      </div>

      {/* Categorías seleccionadas */}
      {selectedCategories.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Categorías seleccionadas:</Label>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category: Category) => (
              <Badge
                key={category.id}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {category.name}
                {!disabled && (
                  <button
                    onClick={() => handleRemoveCategory(category.id)}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Lista de categorías */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Categorías disponibles:</Label>
        <ScrollArea className="rounded-md border p-2" style={{ maxHeight }}>
          {filteredCategories.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              {searchTerm ? "No se encontraron categorías" : "No hay categorías disponibles"}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCategories.map((category: Category) => (
                <div
                  key={category.id}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-sm cursor-pointer"
                  onClick={() => handleToggleCategory(category.id)}
                >
                  <Checkbox
                    id={category.id}
                    checked={value.includes(category.id)}
                    onCheckedChange={() => handleToggleCategory(category.id)}
                    disabled={disabled}
                  />
                  <Label
                    htmlFor={category.id}
                    className="flex-1 cursor-pointer select-none"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}