"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import { StockInModal } from "./stock-in-modal"
import { StockOutModal } from "./stock-out-modal"

interface StockMovementsProps {
  showButtons?: boolean
  className?: string
}

export function StockMovements({ showButtons = true, className }: StockMovementsProps) {
  const [stockInOpen, setStockInOpen] = useState(false)
  const [stockOutOpen, setStockOutOpen] = useState(false)

  return (
    <div className={className}>
      {showButtons && (
        <div className="flex gap-2">
          <Button 
            onClick={() => setStockInOpen(true)} 
            className="bg-green-600 hover:bg-green-700"
          >
            <ArrowUpCircle className="h-4 w-4 mr-2" />
            Entrada
          </Button>
          <Button 
            onClick={() => setStockOutOpen(true)} 
            className="bg-red-600 hover:bg-red-700"
          >
            <ArrowDownCircle className="h-4 w-4 mr-2" />
            Salida
          </Button>
        </div>
      )}

      <StockInModal 
        open={stockInOpen} 
        onOpenChange={setStockInOpen} 
      />
      
      <StockOutModal 
        open={stockOutOpen} 
        onOpenChange={setStockOutOpen} 
      />
    </div>
  )
}

// Export individual components and hooks for more control
export { StockInModal } from "./stock-in-modal"
export { StockOutModal } from "./stock-out-modal"

// Hook para control programático
export function useStockMovements() {
  const [stockInOpen, setStockInOpen] = useState(false)
  const [stockOutOpen, setStockOutOpen] = useState(false)

  return {
    stockIn: {
      open: stockInOpen,
      setOpen: setStockInOpen,
    },
    stockOut: {
      open: stockOutOpen,
      setOpen: setStockOutOpen,
    },
  }
}