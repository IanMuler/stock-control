# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

StockControl is a modern inventory management system built with Next.js 14 that replaces traditional spreadsheets. It features real-time stock tracking, user authentication, automated alerts, and comprehensive reporting capabilities.

## Core Architecture

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth and credentials
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state
- **Package Manager**: pnpm (note: pnpm-lock.yaml exists)

## Development Commands

### Essential Commands
```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

### Database Commands
```bash
# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Open Prisma Studio for database management
npx prisma studio

# Reset database (development only)
npx prisma migrate reset
```

## Database Schema

The system uses PostgreSQL with the following core entities:
- **User**: Authentication with role-based access (ADMIN/OPERATOR)
- **Product**: Inventory items with stock tracking and categories
- **Category**: Product categorization
- **Movement**: Stock movements (IN/OUT) with audit trail
- **Alert**: Automated low stock notifications

## Key Architecture Patterns

### API Structure
- All API routes follow RESTful conventions in `app/api/`
- Routes use NextAuth session validation
- Prisma client handles all database operations
- Error handling returns consistent JSON responses

### Frontend Components
- Uses shadcn/ui component library extensively
- Main layout wrapper: `MainLayout` component
- TanStack Query for data fetching and caching
- Client-side routing with Next.js App Router

### Authentication Flow
- Session-based authentication with NextAuth.js
- Role-based access control (Admin/Operator roles)
- Demo credentials: admin@example.com/admin123, operator@example.com/operator123
- Google OAuth integration available

## Development Notes

### Environment Setup
Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: NextAuth secret key
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: OAuth credentials

### Code Conventions
- Spanish language used for UI text and database content
- TypeScript strict mode enabled
- ESLint and TypeScript errors ignored during builds (see next.config.mjs)
- Prisma schema uses `@@map` for table naming conventions

### Stock Management Logic
- Products have `currentStock` and `minStock` fields
- Stock updates happen through Movement records
- Low stock alerts generated automatically when currentStock <= minStock
- Soft delete pattern used (isActive boolean flag)

## Testing and Deployment

The README mentions testing commands but no test files are present in the current structure:
- Unit tests: `npm run test` (not implemented)
- E2E tests: `npm run cypress:open` (not implemented)

Deployment configured for Vercel with automatic deployments.