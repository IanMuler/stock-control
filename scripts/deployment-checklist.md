# Checklist de Deployment - Migración de Categorías

## Pre-Deployment (Antes del despliegue)

### ✅ Preparación
- [ ] **Backup completo de BD de producción**
  ```bash
  pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
  ```
- [ ] **Verificar que tienes acceso de rollback rápido**
- [ ] **Notificar a usuarios de mantenimiento programado** (5-10 min)
- [ ] **Verificar scripts de migración en staging/desarrollo**

### ✅ Archivos Necesarios
- [ ] `scripts/migrate-categories.sql` - Script principal de migración
- [ ] `scripts/verify-migration.js` - Script de verificación 
- [ ] `scripts/rollback-categories.sql` - Plan de rollback
- [ ] Código actualizado con nueva lógica de categorías

## Deployment Steps (Durante el despliegue)

### PASO 1: Backup y Preparación (2-3 min)
- [ ] **Parar la aplicación temporalmente**
- [ ] **Hacer backup final**
  ```bash
  pg_dump $DATABASE_URL > backup_final_pre_migration.sql
  ```
- [ ] **Verificar que backup es válido**

### PASO 2: Migración de Base de Datos (1-2 min)
- [ ] **Ejecutar migración**
  ```bash
  psql $DATABASE_URL -f scripts/migrate-categories.sql
  ```
- [ ] **Verificar que no hay errores en la migración**
- [ ] **Confirmar mensaje "MIGRACIÓN EXITOSA ✓"**

### PASO 3: Despliegue de Código (1-2 min)
- [ ] **Desplegar nueva versión de la aplicación**
- [ ] **Ejecutar prisma generate si es necesario**
- [ ] **Iniciar aplicación**

### PASO 4: Verificación Inmediata (2-3 min)
- [ ] **Ejecutar script de verificación**
  ```bash
  node scripts/verify-migration.js
  ```
- [ ] **Verificar que la aplicación inicia correctamente**
- [ ] **Probar funcionalidades críticas:**
  - [ ] Login funciona
  - [ ] Dashboard carga correctamente
  - [ ] Lista de productos muestra categorías
  - [ ] Crear/editar productos funciona
  - [ ] Reportes generan correctamente
  - [ ] Exportar Excel funciona

## Post-Deployment (Después del despliegue)

### ✅ Verificación Extendida (5-10 min)
- [ ] **Monitorear logs por errores**
- [ ] **Verificar que todos los productos mantienen sus categorías**
- [ ] **Probar filtros por categoría**
- [ ] **Verificar reportes por categoría**
- [ ] **Confirmar que exports incluyen categorías correctamente**

### ✅ Comunicación
- [ ] **Notificar fin de mantenimiento a usuarios**
- [ ] **Documentar cualquier issue encontrado**
- [ ] **Confirmar que todo está funcionando normalmente**

## Troubleshooting

### Si algo sale mal durante la migración:
1. **PARAR inmediatamente**
2. **Ejecutar rollback:**
   ```bash
   psql $DATABASE_URL -f scripts/rollback-categories.sql
   ```
3. **Restaurar backup si es necesario:**
   ```bash
   psql $DATABASE_URL < backup_final_pre_migration.sql
   ```
4. **Analizar logs y corregir problemas**

### Si hay errores después del deployment:
1. **Verificar logs de aplicación**
2. **Ejecutar script de verificación**
3. **Si es crítico, considerar rollback de aplicación**
4. **La migración de datos puede mantenerse (es backward compatible)**

## Limpieza Post-Migración (Opcional - Después de 1-2 semanas)

### ✅ Una vez confirmado que todo funciona:
- [ ] **Remover columna categoryId de productos** (opcional)
- [ ] **Limpiar código legacy si existía**
- [ ] **Actualizar documentación**
- [ ] **Eliminar backups antiguos**

## Tiempo Estimado Total
- **Downtime**: 5-10 minutos
- **Verificación**: 10-15 minutos  
- **Total**: 15-25 minutos

## Contactos de Emergencia
- **DBA/DevOps**: [Tu contacto]
- **Lead Developer**: [Tu contacto]
- **Backup Person**: [Tu contacto]

---

**NOTA IMPORTANTE**: Este checklist asume que has probado la migración en un ambiente de staging idéntico a producción.