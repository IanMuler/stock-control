-- ROLLBACK DE MIGRACIÓN DE CATEGORÍAS
-- USAR SOLO SI HAY PROBLEMAS CON LA MIGRACIÓN

-- ========================================
-- VERIFICAR ESTADO ANTES DEL ROLLBACK
-- ========================================

DO $$
DECLARE
    productos_total INTEGER;
    productos_con_junction INTEGER;
    productos_con_category_id INTEGER;
BEGIN
    -- Estadísticas actuales
    SELECT COUNT(*) INTO productos_total FROM products;
    SELECT COUNT(DISTINCT "productId") INTO productos_con_junction FROM product_categories;
    SELECT COUNT(*) INTO productos_con_category_id FROM products WHERE "categoryId" IS NOT NULL;
    
    RAISE NOTICE 'ESTADO ACTUAL:';
    RAISE NOTICE 'Total productos: %', productos_total;
    RAISE NOTICE 'Productos en junction table: %', productos_con_junction;
    RAISE NOTICE 'Productos con categoryId: %', productos_con_category_id;
END $$;

-- ========================================
-- OPCIÓN 1: ROLLBACK SUAVE (RECOMENDADO)
-- ========================================
-- Solo deshabilita la nueva funcionalidad sin borrar datos

-- Si necesitas volver temporalmente a categoryId:
-- 1. Actualizar código para usar categoryId en lugar de junction table
-- 2. Verificar que categoryId esté poblado
-- 3. La junction table queda intacta para intentar migración después

-- Verificar que todos los productos mantengan su categoryId original
SELECT 
    'Productos sin categoryId que SÍ tienen categoría en junction:' as problema,
    COUNT(*) as cantidad
FROM products p
INNER JOIN product_categories pc ON p.id = pc."productId"
WHERE p."categoryId" IS NULL OR p."categoryId" = '';

-- ========================================
-- OPCIÓN 2: ROLLBACK COMPLETO (PELIGROSO)
-- ========================================
-- ⚠️  SOLO USAR SI ESTÁS SEGURO Y TIENES BACKUP

-- Confirmar que quieres proceder con rollback completo
-- UNCOMMENT SOLO SI ESTÁS SEGURO:

/*
-- Restaurar categoryId desde junction table (primera categoría)
UPDATE products 
SET "categoryId" = (
    SELECT pc."categoryId" 
    FROM product_categories pc 
    WHERE pc."productId" = products.id 
    LIMIT 1
)
WHERE id IN (
    SELECT DISTINCT "productId" 
    FROM product_categories
);

-- Borrar junction table
DROP TABLE IF EXISTS product_categories;

-- Verificar resultado
SELECT 
    COUNT(*) as productos_total,
    COUNT(CASE WHEN "categoryId" IS NOT NULL THEN 1 END) as con_categoria,
    COUNT(CASE WHEN "categoryId" IS NULL THEN 1 END) as sin_categoria
FROM products;
*/

-- ========================================
-- VERIFICACIÓN POST-ROLLBACK
-- ========================================

-- Ejecutar después del rollback para verificar integridad
SELECT 
    'Verificación de integridad después del rollback:' as titulo,
    COUNT(*) as total_productos,
    COUNT(CASE WHEN "categoryId" IS NOT NULL THEN 1 END) as productos_con_categoria,
    COUNT(CASE WHEN "categoryId" IS NULL THEN 1 END) as productos_sin_categoria
FROM products;

-- ========================================
-- NOTAS IMPORTANTES:
-- ========================================
-- 1. SIEMPRE hacer backup antes del rollback
-- 2. El rollback suave es MÁS SEGURO (opción 1)
-- 3. Solo usar rollback completo si es absolutamente necesario
-- 4. Verificar que la aplicación funcione después del rollback
-- 5. Considerar que se perderán productos con múltiples categorías (en rollback completo)