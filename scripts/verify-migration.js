// SCRIPT DE VERIFICACIÓN POST-MIGRACIÓN
// Ejecutar con: node scripts/verify-migration.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyMigration() {
  console.log('🔍 Verificando migración de categorías...\n');

  try {
    // 1. Verificar estructura de tablas
    console.log('📊 Estadísticas generales:');
    
    const totalProducts = await prisma.product.count();
    const totalCategories = await prisma.category.count();
    const totalProductCategories = await prisma.productCategory.count();
    
    console.log(`- Total productos: ${totalProducts}`);
    console.log(`- Total categorías: ${totalCategories}`);
    console.log(`- Total relaciones producto-categoría: ${totalProductCategories}\n`);

    // 2. Verificar productos con categorías
    const productsWithCategories = await prisma.product.count({
      where: {
        categories: {
          some: {}
        }
      }
    });

    const productsWithoutCategories = totalProducts - productsWithCategories;
    
    console.log('📦 Distribución de productos:');
    console.log(`- Con categorías: ${productsWithCategories}`);
    console.log(`- Sin categorías: ${productsWithoutCategories}\n`);

    // 3. Verificar duplicados en junction table
    const duplicateCheck = await prisma.$queryRaw`
      SELECT "productId", "categoryId", COUNT(*) as count
      FROM product_categories 
      GROUP BY "productId", "categoryId" 
      HAVING COUNT(*) > 1
    `;

    if (duplicateCheck.length > 0) {
      console.log('⚠️  ADVERTENCIA: Encontrados duplicados en product_categories:');
      console.log(duplicateCheck);
    } else {
      console.log('✅ No hay duplicados en product_categories');
    }

    // 4. Verificar integridad referencial
    const orphanProductCategories = await prisma.$queryRaw`
      SELECT pc.id, pc."productId", pc."categoryId"
      FROM product_categories pc
      LEFT JOIN products p ON pc."productId" = p.id
      LEFT JOIN categories c ON pc."categoryId" = c.id
      WHERE p.id IS NULL OR c.id IS NULL
    `;

    if (orphanProductCategories.length > 0) {
      console.log('⚠️  ADVERTENCIA: Referencias rotas encontradas:');
      console.log(orphanProductCategories);
    } else {
      console.log('✅ Integridad referencial OK');
    }

    // 5. Verificar que los endpoints funcionan
    console.log('\n🔧 Verificando funcionalidad de APIs:');
    
    // Test productos con categorías
    const productsWithCategoriesData = await prisma.product.findMany({
      include: {
        categories: {
          include: {
            category: true
          }
        }
      },
      take: 5
    });

    console.log('✅ Query de productos con categorías funciona');
    console.log(`   Ejemplo: ${productsWithCategoriesData[0]?.name} - Categorías: ${productsWithCategoriesData[0]?.categories.length || 0}`);

    // Test filtrado por categoría
    if (totalCategories > 0) {
      const firstCategory = await prisma.category.findFirst();
      const productsInCategory = await prisma.product.count({
        where: {
          categories: {
            some: {
              categoryId: firstCategory.id
            }
          }
        }
      });
      console.log(`✅ Filtrado por categoría funciona`);
      console.log(`   Productos en "${firstCategory.name}": ${productsInCategory}`);
    }

    // 6. Verificar reportes
    console.log('\n📊 Verificando reportes:');
    const reportData = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        code: true,
        name: true,
        currentStock: true,
        minStock: true,
        categories: {
          select: {
            category: {
              select: { name: true }
            }
          }
        }
      },
      take: 3
    });

    console.log('✅ Estructura de reportes OK');
    reportData.forEach(product => {
      const categoryName = product.categories?.[0]?.category?.name || 'Sin categoría';
      console.log(`   ${product.code}: ${categoryName}`);
    });

    console.log('\n🎉 VERIFICACIÓN COMPLETADA');
    console.log('✅ La migración parece haberse completado exitosamente\n');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    console.log('\n🚨 Revisar la migración o considerar rollback\n');
  } finally {
    await prisma.$disconnect();
  }
}

// Función para verificar si existe la columna categoryId (estructura antigua)
async function checkOldStructure() {
  try {
    // Intentar consultar categoryId
    await prisma.$queryRaw`SELECT "categoryId" FROM products LIMIT 1`;
    console.log('ℹ️  Columna categoryId aún existe (normal durante transición)');
    return true;
  } catch (error) {
    console.log('ℹ️  Columna categoryId no encontrada (migración completa)');
    return false;
  }
}

// Función principal
async function main() {
  console.log('🔄 Iniciando verificación de migración...\n');
  
  const hasOldStructure = await checkOldStructure();
  await verifyMigration();
  
  if (hasOldStructure) {
    console.log('💡 RECOMENDACIÓN: La columna categoryId aún existe.');
    console.log('   Esto es normal durante la transición y permite rollback.');
    console.log('   Considera removerla después de verificar que todo funciona.\n');
  }
}

main().catch(console.error);