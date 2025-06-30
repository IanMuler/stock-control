"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { exportToExcel, downloadExcel, REPORT_CONFIGS, type ExcelColumn } from "@/lib/export-excel"

interface ExportExcelButtonProps {
  data: any[]
  type?: keyof typeof REPORT_CONFIGS
  columns?: ExcelColumn[]
  sheetName?: string
  filename?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  disabled?: boolean
  className?: string
}

export function ExportExcelButton({
  data,
  type,
  columns,
  sheetName,
  filename,
  variant = "outline",
  size = "default",
  disabled = false,
  className,
}: ExportExcelButtonProps) {
  const handleExport = () => {
    if (!data || data.length === 0) return;

    let config;
    
    if (type && REPORT_CONFIGS[type]) {
      // Usar configuración predefinida
      config = REPORT_CONFIGS[type];
    } else if (columns && sheetName) {
      // Usar configuración personalizada
      config = { columns, sheetName };
    } else {
      console.error("Debe proporcionar 'type' o 'columns' y 'sheetName'");
      return;
    }

    // Generar nombre de archivo
    const timestamp = new Date().toISOString().split('T')[0];
    const finalFilename = filename || `reporte-${type || 'datos'}-${timestamp}.xlsx`;

    try {
      const excelBlob = exportToExcel({
        data,
        columns: config.columns,
        sheetName: config.sheetName,
        filename: finalFilename
      });

      downloadExcel(excelBlob, finalFilename);
    } catch (error) {
      console.error("Error al exportar Excel:", error);
    }
  };

  return (
    <Button
      onClick={handleExport}
      variant={variant}
      size={size}
      disabled={disabled || !data || data.length === 0}
      className={className}
    >
      <Download className="h-4 w-4 mr-2" />
      Exportar Excel
    </Button>
  );
}