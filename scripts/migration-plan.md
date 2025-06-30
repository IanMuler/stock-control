# Plan de Migración a Producción - Múltiples Categorías

## Situación Actual
- **Desarrollo**: Base de datos con nueva estructura (many-to-many)
- **Producción**: Base de datos con estructura antigua (one-to-many con `categoryId`)

## Estructura Antigua vs Nueva

### Estructura Antigua (Producción)
```sql
-- Tabla products con categoryId
products (
  id, code, name, description, unit, minStock, currentStock, 
  isActive, createdAt, updatedAt, categoryId  -- COLUMNA A MIGRAR
)

-- Tabla categories normal
categories (id, name, description, createdAt, updatedAt)
```

### Estructura Nueva (Desarrollo)
```sql
-- Tabla products SIN categoryId
products (
  id, code, name, description, unit, minStock, currentStock, 
  isActive, createdAt, updatedAt  -- SIN categoryId
)

-- Nueva tabla junction
product_categories (
  id, productId, categoryId, createdAt
)
```

## Plan de Migración Paso a Paso

### PASO 1: Backup Completo
```bash
# Hacer backup completo antes de cualquier cambio
pg_dump $DATABASE_URL > backup_pre_migration_$(date +%Y%m%d_%H%M%S).sql
```

### PASO 2: Crear Script de Migración de Datos
Crear archivo: `scripts/migrate-categories.sql`

### PASO 3: Migración con Downtime Mínimo
1. **Crear tabla junction SIN borrar categoryId**
2. **Migrar datos existentes**
3. **Verificar integridad**
4. **Actualizar aplicación**
5. **Remover categoryId** (opcional, puede dejarse para rollback)

### PASO 4: Rollback Plan
- Mantener `categoryId` como respaldo por unas semanas
- Script para revertir si hay problemas

## Scripts Necesarios

### Script 1: Crear Junction Table (Seguro)
### Script 2: Migrar Datos Existentes
### Script 3: Verificación de Integridad
### Script 4: Cleanup (Opcional)

## Validaciones Post-Migración
1. Contar productos con/sin categorías
2. Verificar que todos los productos mantengan su categoría original
3. Probar funcionalidad crítica (reportes, stock, etc.)
4. Monitorear logs por errores relacionados a categorías

## Tiempo Estimado
- **Backup**: 2-5 minutos
- **Migración**: 30 segundos - 2 minutos (dependiendo de datos)
- **Verificación**: 5 minutos
- **Total downtime**: < 10 minutos

## Consideraciones Especiales
- Si tienes productos SIN categoría (categoryId NULL), se manejará apropiadamente
- La migración es **idempotente** (puede ejecutarse múltiples veces)
- Se mantendrá compatibilidad durante el proceso