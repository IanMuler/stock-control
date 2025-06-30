const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpiar datos existentes
  await prisma.productCategory.deleteMany();
  await prisma.movement.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Base de datos limpiada');

  // Crear usuarios
  const adminUser = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@example.com',
      role: 'ADMIN',
    },
  });

  const operatorUser = await prisma.user.create({
    data: {
      name: 'Operador',
      email: 'operator@example.com',
      role: 'OPERATOR',
    },
  });

  console.log('✅ Usuarios creados');

  // Crear categorías
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Electrónicos',
        description: 'Dispositivos electrónicos y accesorios',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Herramientas',
        description: 'Herramientas de trabajo y construcción',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Oficina',
        description: 'Suministros y equipos de oficina',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Hogar',
        description: 'Artículos para el hogar',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Automotriz',
        description: 'Repuestos y accesorios para vehículos',
      },
    }),
  ]);

  console.log('✅ Categorías creadas');

  // Crear productos
  const products = [
    {
      code: 'ELEC001',
      name: 'Smartphone Samsung Galaxy',
      description: 'Teléfono inteligente de última generación',
      unit: 'unidad',
      minStock: 5,
      currentStock: 12,
      categories: [categories[0].id], // Electrónicos
    },
    {
      code: 'ELEC002',
      name: 'Laptop HP Pavilion',
      description: 'Computadora portátil para uso profesional',
      unit: 'unidad',
      minStock: 3,
      currentStock: 8,
      categories: [categories[0].id, categories[2].id], // Electrónicos, Oficina
    },
    {
      code: 'HERR001',
      name: 'Taladro Bosch',
      description: 'Taladro eléctrico con percutor',
      unit: 'unidad',
      minStock: 2,
      currentStock: 6,
      categories: [categories[1].id], // Herramientas
    },
    {
      code: 'HERR002',
      name: 'Martillo de Acero',
      description: 'Martillo profesional con mango de fibra',
      unit: 'unidad',
      minStock: 10,
      currentStock: 25,
      categories: [categories[1].id], // Herramientas
    },
    {
      code: 'OFIC001',
      name: 'Impresora Canon',
      description: 'Impresora multifunción láser',
      unit: 'unidad',
      minStock: 2,
      currentStock: 4,
      categories: [categories[2].id, categories[0].id], // Oficina, Electrónicos
    },
    {
      code: 'OFIC002',
      name: 'Papel A4',
      description: 'Resma de papel A4 500 hojas',
      unit: 'resma',
      minStock: 20,
      currentStock: 45,
      categories: [categories[2].id], // Oficina
    },
    {
      code: 'HOGAR001',
      name: 'Aspiradora LG',
      description: 'Aspiradora sin bolsa con filtro HEPA',
      unit: 'unidad',
      minStock: 3,
      currentStock: 7,
      categories: [categories[3].id, categories[0].id], // Hogar, Electrónicos
    },
    {
      code: 'HOGAR002',
      name: 'Juego de Sábanas',
      description: 'Juego de sábanas matrimoniales 100% algodón',
      unit: 'juego',
      minStock: 8,
      currentStock: 15,
      categories: [categories[3].id], // Hogar
    },
    {
      code: 'AUTO001',
      name: 'Aceite Motor 5W30',
      description: 'Aceite sintético para motor 4 litros',
      unit: 'litro',
      minStock: 50,
      currentStock: 120,
      categories: [categories[4].id], // Automotriz
    },
    {
      code: 'AUTO002',
      name: 'Filtro de Aire',
      description: 'Filtro de aire universal para automóviles',
      unit: 'unidad',
      minStock: 15,
      currentStock: 8, // Bajo stock para generar alerta
      categories: [categories[4].id], // Automotriz
    },
    {
      code: 'ELEC003',
      name: 'Auriculares Bluetooth',
      description: 'Auriculares inalámbricos con cancelación de ruido',
      unit: 'unidad',
      minStock: 10,
      currentStock: 22,
      categories: [categories[0].id], // Electrónicos
    },
    {
      code: 'HERR003',
      name: 'Destornillador Set',
      description: 'Set de destornilladores phillips y planos',
      unit: 'set',
      minStock: 5,
      currentStock: 12,
      categories: [categories[1].id], // Herramientas
    },
  ];

  const createdProducts = [];
  for (const productData of products) {
    const { categories: categoryIds, ...productInfo } = productData;
    
    const product = await prisma.product.create({
      data: productInfo,
    });

    // Crear relaciones con categorías
    for (const categoryId of categoryIds) {
      await prisma.productCategory.create({
        data: {
          productId: product.id,
          categoryId: categoryId,
        },
      });
    }

    createdProducts.push(product);
  }

  console.log('✅ Productos creados');

  // Crear movimientos de stock
  const movements = [];
  for (let i = 0; i < createdProducts.length; i++) {
    const product = createdProducts[i];
    const user = i % 2 === 0 ? adminUser : operatorUser;
    
    // Movimiento de entrada (stock inicial)
    await prisma.movement.create({
      data: {
        type: 'IN',
        quantity: product.currentStock,
        description: 'Stock inicial',
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Último mes
        productId: product.id,
        userId: user.id,
      },
    });

    // Algunos movimientos adicionales
    if (i % 3 === 0) {
      await prisma.movement.create({
        data: {
          type: 'OUT',
          quantity: Math.floor(Math.random() * 5) + 1,
          description: 'Venta',
          date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Última semana
          productId: product.id,
          userId: user.id,
        },
      });
    }
  }

  console.log('✅ Movimientos creados');

  // Crear alertas para productos con stock bajo
  const lowStockProducts = createdProducts.filter(p => p.currentStock <= p.minStock);
  
  for (const product of lowStockProducts) {
    await prisma.alert.create({
      data: {
        type: 'LOW_STOCK',
        message: `Stock bajo para ${product.name}. Stock actual: ${product.currentStock}, Stock mínimo: ${product.minStock}`,
        productId: product.id,
      },
    });
  }

  console.log('✅ Alertas creadas');

  console.log('🎉 Seed completado exitosamente!');
  console.log(`   👥 ${2} usuarios creados`);
  console.log(`   📁 ${categories.length} categorías creadas`);
  console.log(`   📦 ${createdProducts.length} productos creados`);
  console.log(`   📋 Movimientos y alertas generados`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });