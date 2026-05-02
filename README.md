# THOTH V2 - Modern Headless CMS

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![NextAuth](https://img.shields.io/badge/NextAuth-v5-3B82F6?style=flat-square)](https://next-auth.js.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

A modernized, API-first Headless CMS built with Next.js 16, featuring a glass-morphism UI and no middleware architecture.

**Open Source Project** - Free to use, modify, and distribute under MIT License

## Features

- **Headless Architecture**: Content management via REST API endpoints
- **No Middleware**: Pure Next.js architecture using proxy pattern
- **Modern UI**: Glass-morphism design with Tailwind CSS v4
- **Multi-role Auth**: Google OAuth + Email/Password with registration
- **Role-based Access**: Admin, Editor, and User roles
- **Auto Database Startup**: Python scripts handle database + server
- **Complete CMS Modules**: Projects, Pages, Posts, Staff, Menu, Media, Site Config

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js v5 with Prisma Adapter
- **UI**: Tailwind CSS v4 with custom glass-morphism
- **Icons**: Lucide React
- **Password Hashing**: bcryptjs

## Project Structure

```
THOTH V2/
├── app/
│   ├── admin/              # Admin dashboard
│   │   ├── page.tsx        # Dashboard overview
│   │   ├── layout.tsx      # Admin layout with sidebar
│   │   └── [modules]/      # CMS module pages
│   ├── api/                # API Routes (Headless)
│   │   ├── auth/           # NextAuth.js handlers
│   │   ├── categories/     # Category CRUD
│   │   ├── projects/       # Project CRUD
│   │   ├── pages/          # Page CRUD
│   │   ├── posts/          # Post CRUD
│   │   ├── staff/          # Staff CRUD
│   │   ├── menu/           # Menu CRUD
│   │   └── site-config/    # Site settings
│   ├── dashboard/          # User dashboard
│   ├── login/              # Login page
│   ├── globals.css         # Global styles
│   └── layout.tsx          # Root layout
├── components/
│   ├── admin/              # Admin UI components
│   │   ├── AdminSidebar.tsx
│   │   ├── AdminHeader.tsx
│   │   └── StatCard.tsx
│   ├── ui/                 # Reusable UI components
│   └── Providers.tsx
├── lib/
│   ├── data/               # Data layer
│   │   ├── category.ts
│   │   ├── project.ts
│   │   ├── page.ts
│   │   ├── post.ts
│   │   ├── staff.ts
│   │   ├── menu.ts
│   │   └── site-config.ts
│   ├── auth-utils.ts       # Auth helpers
│   └── prisma.ts           # Prisma client
├── prisma/
│   └── schema.prisma       # Database schema
├── auth.ts                 # NextAuth.js config
└── package.json
```

-----

## Getting Started

### Quick Start (Python Scripts)

Use the provided Python scripts to start everything automatically:

```bash
# Development (starts database + dev server)
python run-dev.py

# Production (starts database + production build)
python run-pro.py

# Stop everything
python stop.py
```

These scripts will:
- Check and start PostgreSQL Docker container automatically
- Run Prisma generate if needed
- Start/stop the Next.js server
- Handle cleanup on exit

### Manual Setup

### 1. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 2. Set up Database

**Option A: Docker (Recommended)**
```bash
# Using existing thoth_dev_db container on port 5433
docker run --name thoth_dev_db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=thoth_dev -p 5433:5432 -d postgres:15
```

**Option B: Local PostgreSQL**
Update `.env` with your database credentials:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/database"
```

### 3. Sync Database Schema
```bash
npx prisma db push --accept-data-loss
npx prisma generate
```

### 4. Run Development Server
```bash
npm run dev
# or
pnpm run dev
```

### 5. Create First User
Register via the web interface at `http://localhost:3000/register`
- Supports email/password registration
- Google OAuth available
- First user can be assigned admin role via database if needed

## Design System

### Glass Morphism
- Background: `rgba(255, 255, 255, 0.7)`
- Border: `rgba(255, 255, 255, 0.35)`
- Backdrop blur: `20px`
- Shadow: `0 20px 55px -32px rgba(15, 23, 42, 0.35)`

### Color Palette
- Primary: `#6366f1` (Indigo)
- Secondary: `#8b5cf6` (Violet)
- Accent: `#f59e0b` (Amber)
- Background: `#f8fafc` (Slate 50)

### Typography
- Headings: `Inter` with tight tracking
- Labels: `0.28em` letter-spacing, uppercase
- Body: `Inter` with standard line-height

## Key Differences from THOTH V1

1. **No Middleware**: Uses proxy pattern instead of Next.js middleware
2. **Modern Architecture**: Next.js 16 App Router with server components
3. **Enhanced Schema**: Added posts, webhooks, audit logs, API tokens
4. **Role System**: Three-tier role system (admin, editor, user)
5. **Glass UI**: Modern glass-morphism design language
6. **Hierarchical Menu**: Support for nested menu items
7. **Credentials Auth**: Email/password support alongside OAuth
8. **Auto Database Startup**: Python scripts handle database + server startup

## Next.js 16 Breaking Changes

### Async searchParams
Page components must await searchParams (it's now a Promise):

```typescript
// Before (Next.js 15 and earlier)
export default function Page({ searchParams }: { searchParams: { id?: string } }) {
  const id = searchParams.id
}

// After (Next.js 16+)
export default async function Page({ 
  searchParams 
}: { 
  searchParams: Promise<{ id?: string }> 
}) {
  const params = await searchParams
  const id = params.id
}
```

### Auth Session Callback
With JWT strategy, session callback uses `token` instead of `user`:

```typescript
session({ session, token }) {
  if (token && session.user) {
    session.user.id = token.sub as string
    session.user.role = token.role as UserRole
  }
  return session
}
```

## Documentation

For detailed technical information, API endpoints, database schema, and architecture details, see **[V.2.md](V.2.md)**.

## License

MIT License - Same as THOTH V1
