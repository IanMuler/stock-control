import * as XLSX from 'xlsx';

export interface ExcelColumn {
  key: string;
  header: string;
  width?: number;
}

export interface ExcelExportOptions {
  data: any[];
  columns: ExcelColumn[];
  sheetName: string;
  filename: string;
}

export function exportToExcel({ data, columns, sheetName, filename }: ExcelExportOptions): Blob {
  // Formatear datos según las columnas especificadas
  const formattedData = data.map(item => {
    const row: Record<string, any> = {};
    columns.forEach(col => {
      // Usar el header como key para el Excel
      row[col.header] = getNestedValue(item, col.key) || "";
    });
    return row;
  });

  // Crear workbook y worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Configurar ancho de columnas
  if (columns.some(col => col.width)) {
    const colWidths = columns.map(col => ({ wch: col.width || 15 }));
    worksheet['!cols'] = colWidths;
  }

  // Agregar hoja al workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generar buffer del archivo Excel
  const excelBuffer = XLSX.write(workbook, { 
    type: 'array', 
    bookType: 'xlsx' 
  });

  // Crear blob
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
}

// Función auxiliar para obtener valores anidados (ej: "categories.0.category.name")
function getNestedValue(obj: any, path: string): any {
  // Casos especiales para categorías
  if (path === 'categories') {
    // Manejar el array de categorías (formato del endpoint /api/reports/export)
    if (obj.categories && Array.isArray(obj.categories) && obj.categories.length > 0) {
      // Filtrar categorías válidas y mapear solo las que tienen nombre
      const validCategories = obj.categories
        .filter((cat: any) => cat.category?.name)
        .map((cat: any) => cat.category.name);
      
      return validCategories.length > 0 ? validCategories.join(", ") : "Sin categoría";
    }
    
    // Manejar categoría como string (formato del endpoint /api/reports)
    if (obj.category && typeof obj.category === 'string') {
      return obj.category !== '-' ? obj.category : "Sin categoría";
    }
    
    // Fallback para formato antiguo (category object)
    if (obj.category && obj.category.name) {
      return obj.category.name;
    }
    
    return "Sin categoría";
  }
  
  // Casos especiales para tipo de movimiento
  if (path === 'type') {
    if (obj.type === 'IN') return 'Entrada';
    if (obj.type === 'OUT') return 'Salida';
    if (obj.type === 'NEUTRAL') return 'Sin cambio';
    return obj.type || '-';
  }
  
  // Casos especiales para fecha
  if (path === 'date') {
    if (obj.date) {
      return new Date(obj.date).toLocaleString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
    return '-';
  }
  
  // Casos especiales para compatibilidad con formato antiguo
  if (path === 'category.name') {
    // Primero intentar el formato nuevo (categories array)
    if (obj.categories && Array.isArray(obj.categories) && obj.categories.length > 0) {
      const firstValidCategory = obj.categories.find((cat: any) => cat.category?.name);
      return firstValidCategory?.category?.name || "Sin categoría";
    }
    // Luego el formato antiguo (category object)
    if (obj.category && obj.category.name) {
      return obj.category.name;
    }
    return "Sin categoría";
  }
  
  return path.split('.').reduce((current, key) => {
    if (current === null || current === undefined) return "";
    
    // Manejar índices de arrays (ej: "0")
    if (!isNaN(Number(key))) {
      return current[parseInt(key)];
    }
    
    return current[key];
  }, obj);
}

// Función helper para descargar el archivo
export function downloadExcel(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// Configuraciones predefinidas para diferentes tipos de reportes
export const REPORT_CONFIGS = {
  stock: {
    columns: [
      { key: 'code', header: 'Código', width: 12 },
      { key: 'name', header: 'Nombre', width: 30 },
      { key: 'currentStock', header: 'Stock Actual', width: 15 },
      { key: 'minStock', header: 'Stock Mínimo', width: 15 },
      { key: 'categories', header: 'Categoría', width: 20 },
    ],
    sheetName: 'Stock Actual'
  },
  movements: {
    columns: [
      { key: 'code', header: 'Código', width: 12 },
      { key: 'name', header: 'Nombre', width: 30 },
      { key: 'categories', header: 'Categoría', width: 20 },
      { key: 'type', header: 'Tipo de Movimiento', width: 18 },
      { key: 'quantity', header: 'Cantidad', width: 12 },
      { key: 'date', header: 'Fecha y Hora', width: 20 },
      { key: 'balance', header: 'Saldo', width: 12 },
      { key: 'currentStock', header: 'Stock Actual', width: 15 },
      { key: 'minStock', header: 'Stock Mínimo', width: 15 },
    ],
    sheetName: 'Movimientos'
  },
  lowStock: {
    columns: [
      { key: 'code', header: 'Código', width: 12 },
      { key: 'name', header: 'Nombre', width: 30 },
      { key: 'currentStock', header: 'Stock Actual', width: 15 },
      { key: 'minStock', header: 'Stock Mínimo', width: 15 },
      { key: 'categories', header: 'Categoría', width: 20 },
    ],
    sheetName: 'Stock Bajo'
  },
  products: {
    columns: [
      { key: 'code', header: 'Código', width: 12 },
      { key: 'name', header: 'Nombre', width: 30 },
      { key: 'description', header: 'Descripción', width: 40 },
      { key: 'unit', header: 'Unidad', width: 12 },
      { key: 'currentStock', header: 'Stock Actual', width: 15 },
      { key: 'minStock', header: 'Stock Mínimo', width: 15 },
      { key: 'categories', header: 'Categoría', width: 20 },
      { key: 'isActive', header: 'Estado', width: 12 },
    ],
    sheetName: 'Productos'
  }
};