# StockControl

Sistema moderno de control de inventario en tiempo real que reemplaza las hojas de cálculo tradicionales.

## 🚀 Características

- **Autenticación segura** con Google OAuth y credenciales
- **Gestión de usuarios** con roles (Admin/Operador)
- **Control de stock en tiempo real** con validaciones
- **Alertas automáticas** para stock mínimo
- **Reportes y exportaciones** en CSV/Excel
- **Auditoría completa** de todos los movimientos
- **Interfaz responsive** optimizada para móviles
- **Dashboard interactivo** con métricas clave

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de datos**: PostgreSQL
- **Autenticación**: NextAuth.js
- **Estado**: TanStack Query
- **UI**: shadcn/ui components

## 📦 Instalación

1. **Clonar el repositorio**
\`\`\`bash
git clone <repository-url>
cd stock-control
\`\`\`

2. **Instalar dependencias**
\`\`\`bash
npm install
# o
pnpm install
\`\`\`

3. **Configurar variables de entorno**
\`\`\`bash
cp .env.example .env
\`\`\`

Edita el archivo `.env` con tus credenciales:
- `DATABASE_URL`: URL de conexión a PostgreSQL
- `NEXTAUTH_SECRET`: Clave secreta para NextAuth
- `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`: Credenciales de Google OAuth

4. **Configurar la base de datos**
\`\`\`bash
npx prisma migrate dev
npx prisma generate
\`\`\`

5. **Poblar con datos de prueba**
\`\`\`bash
# Ejecutar el script SQL desde el panel de administración
# o usar prisma studio para insertar datos manualmente
npx prisma studio
\`\`\`

6. **Iniciar el servidor de desarrollo**
\`\`\`bash
npm run dev
# o
pnpm dev
\`\`\`

## 🔐 Credenciales de Prueba

Para probar la aplicación, puedes usar estas credenciales:

- **Administrador**: admin@example.com / admin123
- **Operador**: operator@example.com / operator123

## 📱 Uso

### Dashboard
- Vista general con métricas clave
- Alertas de stock bajo
- Accesos rápidos a funciones principales

### Gestión de Productos
- Crear, editar y eliminar productos
- Organizar por categorías
- Definir stock mínimo

### Movimientos
- **Entradas**: Registrar ingresos de mercancía
- **Salidas**: Registrar egresos con validación de stock
- Historial completo de movimientos

### Control de Stock
- Vista en tiempo real del inventario
- Filtros por categoría y búsqueda
- Indicadores visuales para stock bajo
- Exportación a CSV

### Reportes
- Movimientos por rango de fechas
- Productos más movidos
- Exportación a Excel/CSV

## 🏗️ Estructura del Proyecto

\`\`\`
├── app/                    # Páginas y API routes (App Router)
│   ├── api/               # Endpoints de la API
│   ├── dashboard/         # Dashboard principal
│   ├── movements/         # Gestión de movimientos
│   ├── products/          # Gestión de productos
│   ├── stock/            # Vista de stock
│   └── reports/          # Reportes
├── components/            # Componentes reutilizables
│   ├── layout/           # Componentes de layout
│   └── ui/               # Componentes de UI (shadcn)
├── lib/                  # Utilidades y configuración
├── prisma/               # Schema y migraciones
└── scripts/              # Scripts de base de datos
\`\`\`

## 🧪 Testing

\`\`\`bash
# Tests unitarios
npm run test

# Tests E2E con Cypress
npm run cypress:open
\`\`\`

## 📊 Scripts Disponibles

- `dev`: Servidor de desarrollo
- `build`: Construir para producción
- `start`: Servidor de producción
- `lint`: Linter de código
- `db:migrate`: Ejecutar migraciones
- `db:generate`: Generar cliente Prisma
- `db:studio`: Abrir Prisma Studio

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Despliega automáticamente

### Docker

\`\`\`bash
# Construir imagen
docker build -t stock-control .

# Ejecutar contenedor
docker run -p 3000:3000 stock-control
\`\`\`

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

---

**StockControl** - Moderniza tu gestión de inventario 📦✨
