-- Create demo users
INSERT INTO users (id, name, email, role, "createdAt", "updatedAt") VALUES
('user1', 'Admin User', 'admin@example.com', 'ADMIN', NOW(), NOW()),
('user2', 'Operator User', 'operator@example.com', 'OPERATOR', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Create categories
INSERT INTO categories (id, name, description, "createdAt", "updatedAt") VALUES
('cat1', 'Electrónicos', 'Productos electrónicos y tecnológicos', NOW(), NOW()),
('cat2', 'Oficina', 'Suministros de oficina', NOW(), NOW()),
('cat3', 'Limpieza', 'Productos de limpieza e higiene', NOW(), NOW()),
('cat4', 'Herramientas', 'Herramientas y equipos', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Create demo products
INSERT INTO products (id, code, name, description, unit, "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES
('prod1', 'ELEC001', 'Laptop Dell Inspiron', 'Laptop para oficina 15 pulgadas', 'unidad', 5, 12, 'cat1', true, NOW(), NOW()),
('prod2', 'ELEC002', 'Mouse Inalámbrico', 'Mouse óptico inalámbrico', 'unidad', 10, 25, 'cat1', true, NOW(), NOW()),
('prod3', 'ELEC003', 'Teclado Mecánico', 'Teclado mecánico RGB', 'unidad', 8, 3, 'cat1', true, NOW(), NOW()),
('prod4', 'OFIC001', 'Papel A4', 'Resma de papel A4 500 hojas', 'resma', 20, 45, 'cat2', true, NOW(), NOW()),
('prod5', 'OFIC002', 'Bolígrafos Azules', 'Caja de bolígrafos azules x12', 'caja', 15, 8, 'cat2', true, NOW(), NOW()),
('prod6', 'LIMP001', 'Detergente Líquido', 'Detergente líquido 1L', 'litro', 12, 2, 'cat3', true, NOW(), NOW()),
('prod7', 'HERR001', 'Destornillador Phillips', 'Destornillador Phillips #2', 'unidad', 6, 15, 'cat4', true, NOW(), NOW()),
('prod8', 'HERR002', 'Martillo', 'Martillo de carpintero 500g', 'unidad', 3, 8, 'cat4', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Create some demo movements
INSERT INTO movements (id, type, quantity, description, date, "productId", "userId", "createdAt") VALUES
('mov1', 'IN', 10, 'Compra inicial', NOW() - INTERVAL '5 days', 'prod1', 'user1', NOW() - INTERVAL '5 days'),
('mov2', 'OUT', 3, 'Asignación a empleados', NOW() - INTERVAL '3 days', 'prod1', 'user2', NOW() - INTERVAL '3 days'),
('mov3', 'IN', 30, 'Restock mensual', NOW() - INTERVAL '7 days', 'prod2', 'user1', NOW() - INTERVAL '7 days'),
('mov4', 'OUT', 5, 'Distribución oficinas', NOW() - INTERVAL '2 days', 'prod2', 'user2', NOW() - INTERVAL '2 days'),
('mov5', 'IN', 15, 'Compra nueva', NOW() - INTERVAL '10 days', 'prod3', 'user1', NOW() - INTERVAL '10 days'),
('mov6', 'OUT', 12, 'Instalación equipos', NOW() - INTERVAL '1 day', 'prod3', 'user2', NOW() - INTERVAL '1 day'),
('mov7', 'IN', 50, 'Pedido mensual', NOW() - INTERVAL '6 days', 'prod4', 'user1', NOW() - INTERVAL '6 days'),
('mov8', 'OUT', 5, 'Uso diario', NOW() - INTERVAL '1 day', 'prod4', 'user2', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Create alerts for low stock products
INSERT INTO alerts (id, type, message, "isRead", "productId", "createdAt") VALUES
('alert1', 'LOW_STOCK', 'Teclado Mecánico tiene stock bajo (3 unidades)', false, 'prod3', NOW()),
('alert2', 'LOW_STOCK', 'Bolígrafos Azules tiene stock bajo (8 unidades)', false, 'prod5', NOW()),
('alert3', 'LOW_STOCK', 'Detergente Líquido tiene stock crítico (2 unidades)', false, 'prod6', NOW())
ON CONFLICT (id) DO NOTHING;
