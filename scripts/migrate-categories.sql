-- MIGRACIÓN DE CATEGORÍAS: One-to-Many → Many-to-Many
-- EJECUTAR EN PRODUCCIÓN CON PRECAUCIÓN

-- ========================================
-- PASO 1: CREAR TABLA JUNCTION (SEGURO)
-- ========================================

-- Crear tabla product_categories si no existe
CREATE TABLE IF NOT EXISTS product_categories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Foreign keys
    CONSTRAINT fk_product_categories_product 
        FOREIGN KEY ("productId") REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_product_categories_category 
        FOREIGN KEY ("categoryId") REFERENCES categories(id) ON DELETE CASCADE,
    
    -- Unique constraint para evitar duplicados
    CONSTRAINT uk_product_category UNIQUE ("productId", "categoryId")
);

-- ========================================
-- PASO 2: MIGRAR DATOS EXISTENTES
-- ========================================

-- Migrar todas las relaciones existentes de categoryId a la tabla junction
-- SOLO si el producto tiene una categoría asignada
INSERT INTO product_categories ("productId", "categoryId", "createdAt")
SELECT 
    p.id as "productId",
    p."categoryId" as "categoryId", 
    NOW() as "createdAt"
FROM products p 
WHERE p."categoryId" IS NOT NULL
  AND p."categoryId" != ''
  -- Evitar duplicados si el script se ejecuta múltiples veces
  AND NOT EXISTS (
    SELECT 1 FROM product_categories pc 
    WHERE pc."productId" = p.id AND pc."categoryId" = p."categoryId"
  );

-- ========================================
-- PASO 3: VERIFICACIÓN DE INTEGRIDAD
-- ========================================

-- Verificar que la migración fue exitosa
DO $$
DECLARE
    productos_con_categoria_original INTEGER;
    productos_en_junction INTEGER;
    productos_sin_categoria INTEGER;
BEGIN
    -- Contar productos con categoría en tabla original
    SELECT COUNT(*) INTO productos_con_categoria_original 
    FROM products 
    WHERE "categoryId" IS NOT NULL AND "categoryId" != '';
    
    -- Contar productos en tabla junction
    SELECT COUNT(DISTINCT "productId") INTO productos_en_junction 
    FROM product_categories;
    
    -- Contar productos sin categoría
    SELECT COUNT(*) INTO productos_sin_categoria 
    FROM products 
    WHERE "categoryId" IS NULL OR "categoryId" = '';
    
    -- Mostrar resultados
    RAISE NOTICE 'MIGRACIÓN COMPLETADA:';
    RAISE NOTICE 'Productos con categoría original: %', productos_con_categoria_original;
    RAISE NOTICE 'Productos migrados a junction: %', productos_en_junction;
    RAISE NOTICE 'Productos sin categoría: %', productos_sin_categoria;
    
    -- Validar que los números coinciden
    IF productos_con_categoria_original != productos_en_junction THEN
        RAISE EXCEPTION 'ERROR: Los números no coinciden. Revisar migración.';
    END IF;
    
    RAISE NOTICE 'MIGRACIÓN EXITOSA ✓';
END $$;

-- ========================================
-- PASO 4: ÍNDICES PARA PERFORMANCE
-- ========================================

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_product_categories_product_id 
ON product_categories ("productId");

CREATE INDEX IF NOT EXISTS idx_product_categories_category_id 
ON product_categories ("categoryId");

-- ========================================
-- INFORMACIÓN ADICIONAL
-- ========================================

-- Consulta para verificar manualmente la migración
-- SELECT 
--     p.code,
--     p.name,
--     c_old.name as categoria_original,
--     c_new.name as categoria_migrada
-- FROM products p 
-- LEFT JOIN categories c_old ON p."categoryId" = c_old.id
-- LEFT JOIN product_categories pc ON p.id = pc."productId"
-- LEFT JOIN categories c_new ON pc."categoryId" = c_new.id
-- ORDER BY p.code;

-- ========================================
-- NOTAS IMPORTANTES:
-- ========================================
-- 1. Este script es IDEMPOTENTE (puede ejecutarse múltiples veces)
-- 2. NO borra la columna categoryId (para rollback)
-- 3. Maneja productos sin categoría apropiadamente
-- 4. Incluye validaciones de integridad
-- 5. La aplicación funcionará con ambas estructuras durante la transición