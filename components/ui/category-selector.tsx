"use client"

import { useState, useMemo } from "react"
import { Search, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useCategories, type Category } from "@/hooks/useCategories"

interface CategorySelectorProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  includeAll?: boolean
  allLabel?: string
  disabled?: boolean
  className?: string
}

export function CategorySelector({
  value,
  onValueChange,
  placeholder = "Seleccionar categoría...",
  includeAll = true,
  allLabel = "Todas las categorías",
  disabled = false,
  className,
}: CategorySelectorProps) {
  const [open, setOpen] = useState(false)
  const { data: categories = [], isLoading } = useCategories()

  const options = useMemo(() => {
    const categoryOptions = categories.map((category: Category) => ({
      value: category.id,
      label: category.name,
    }))

    if (includeAll) {
      return [
        { value: "all", label: allLabel },
        ...categoryOptions,
      ]
    }

    return categoryOptions
  }, [categories, includeAll, allLabel])

  const selectedOption = options.find((option: { value: string; label: string }) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className={cn("w-full justify-between", className)}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar categoría..." />
          <CommandEmpty>No se encontró ninguna categoría.</CommandEmpty>
          <CommandGroup>
            {options.map((option: { value: string; label: string }) => (
              <CommandItem
                key={option.value}
                onSelect={() => {
                  onValueChange?.(option.value)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}