"use client"

import { useState, useMemo } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
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
import { useProducts, type Product } from "@/hooks/useProducts"

interface ProductSelectorProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  includeAll?: boolean
  allLabel?: string
  disabled?: boolean
  className?: string
  categoryId?: string
}

export function ProductSelector({
  value,
  onValueChange,
  placeholder = "Seleccionar producto...",
  includeAll = true,
  allLabel = "Todos los productos",
  disabled = false,
  className,
  categoryId,
}: ProductSelectorProps) {
  const [open, setOpen] = useState(false)
  const { data: products = [], isLoading } = useProducts(categoryId)

  const options = useMemo(() => {
    const productOptions = products.map((product: Product) => ({
      value: product.id,
      label: `${product.code} - ${product.name}`,
    }))

    if (includeAll) {
      return [
        { value: "all", label: allLabel },
        ...productOptions,
      ]
    }

    return productOptions
  }, [products, includeAll, allLabel])

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
      <PopoverContent className="w-full p-0 max-h-[300px]">
        <Command>
          <CommandInput placeholder="Buscar producto..." />
          <CommandEmpty>No se encontró ningún producto.</CommandEmpty>
          <CommandGroup className="max-h-[240px] overflow-y-auto">
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