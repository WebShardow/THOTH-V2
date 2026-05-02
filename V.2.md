# การเปลี่ยนแปลงใน V.2

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> **Open Source Project** - โปรเจกต์โอเพ่นซอร์ส ภายใต้สัญญาอนุญาติ MIT

## สรุปงานที่เสร็จสิ้น

ปรับแต่ง **THOTH V2** ให้เป็น **Modern Headless CMS** สมบูรณ์แล้ว:

### สิ่งที่สร้าง/ปรับปรุง:

**1. Database Schema ([prisma/schema.prisma](cci:7://file:///C:/Users/User/Documents/GitHub/WebShardow/THOTH%20V2/prisma/schema.prisma:0:0-0:0))**
- **Content Models**: Project, Category, Page, Post, StaffMember, MenuItem
- **System Models**: SiteConfig, Media, ApiToken, Webhook, AuditLog
- **Enhanced Auth**: UserRole enum (admin, editor, user) + password field

## Database Schema

### Content Models
- **Project**: Portfolio items with categories, galleries, tools
- **Category**: Hierarchical categorization for projects/posts
- **Page**: Document-style content with layouts
- **Post**: Blog-style content with publishing dates
- **StaffMember**: Team directory with social links
- **MenuItem**: Navigation with hierarchical support

### System Models
- **SiteConfig**: Site-wide settings and theming
- **Media**: File uploads with metadata
- **ApiToken**: API authentication tokens
- **Webhook**: External integrations
- **AuditLog**: Activity tracking

**2. Data Layer (`lib/data/`)**
- [category.ts](cci:7://file:///C:/Users/User/Documents/GitHub/WebShardow/THOTH%20V2/lib/data/category.ts:0:0-0:0), [project.ts](cci:7://file:///C:/Users/User/Documents/GitHub/WebShardow/THOTH%20V2/lib/data/project.ts:0:0-0:0), [page.ts](cci:7://file:///C:/Users/User/Documents/GitHub/WebShardow/THOTH%20V2/lib/data/page.ts:0:0-0:0), [post.ts](cci:7://file:///C:/Users/User/Documents/GitHub/WebShardow/THOTH%20V2/lib/data/post.ts:0:0-0:0), [staff.ts](cci:7://file:///C:/Users/User/Documents/GitHub/WebShardow/THOTH%20V2/lib/data/staff.ts:0:0-0:0), [menu.ts](cci:7://file:///C:/Users/User/Documents/GitHub/WebShardow/THOTH%20V2/lib/data/menu.ts:0:0-0:0), [site-config.ts](cci:7://file:///C:/Users/User/Documents/GitHub/WebShardow/THOTH%20V2/lib/data/site-config.ts:0:0-0:0)
- Type-safe CRUD operations with Prisma
- Consistent API patterns

**3. API Routes (`app/api/`)**
- **Public APIs**: `/categories`, `/projects`, `/pages`, `/posts`, `/staff`, `/menu`, `/site-config`
- **Dynamic Routes**: `/{resource}/[id]` สำหรับ GET/PATCH/DELETE รายการเดี่ยว
- **Protected APIs**: POST/PATCH/DELETE with role-based access
- **Query filters**: `?published=true`, `?featured=true`, `?categoryId=xxx`

## API Endpoints

### Public Endpoints (No Auth Required)
```
GET  /api/categories        - List all categories
GET  /api/categories/[id]   - Get single category
GET  /api/projects          - List projects (with filters)
GET  /api/projects/[id]     - Get single project
GET  /api/pages            - List pages (with filters)
GET  /api/pages/[id]       - Get single page
GET  /api/posts            - List posts (with filters)
GET  /api/posts/[id]       - Get single post
GET  /api/staff            - List staff members
GET  /api/staff/[id]       - Get single staff
GET  /api/menu             - List menu items
GET  /api/site-config       - Get site configuration
```

### Protected Endpoints (Admin/Editor Only)
```
POST   /api/categories          - Create category
PATCH  /api/categories/[id]    - Update category
DELETE /api/categories/[id]    - Delete category

POST   /api/projects          - Create project
PATCH  /api/projects/[id]     - Update project
DELETE /api/projects/[id]     - Delete project

POST   /api/pages             - Create page
PATCH  /api/pages/[id]        - Update page
DELETE /api/pages/[id]        - Delete page

POST   /api/posts             - Create post
PATCH  /api/posts/[id]        - Update post
DELETE /api/posts/[id]        - Delete post

POST   /api/staff             - Create staff
PATCH  /api/staff/[id]       - Update staff
DELETE /api/staff/[id]       - Delete staff

POST   /api/menu              - Create menu item
PATCH  /api/menu/[id]         - Update menu item
DELETE /api/menu/[id]         - Delete menu item
PATCH  /api/menu              - Reorder menu items

PATCH  /api/site-config       - Update site configuration
```

**4. Authentication ([auth.ts](cci:7://file:///C:/Users/User/Documents/GitHub/WebShardow/THOTH%20V2/auth.ts:0:0-0:0))**
- Google OAuth provider
- Credentials provider (email/password with bcrypt)
- **Email/Password Registration** - Register page with form validation
- Role-based session handling
- JWT strategy
- **Next.js 16 fixes** - Async searchParams, token-based session callback

**5. Admin UI Components**
- [AdminSidebar.tsx](cci:7://file:///C:/Users/User/Documents/GitHub/WebShardow/THOTH%20V2/components/admin/AdminSidebar.tsx:0:0-0:0) - Collapsible glass-morphism sidebar
- [AdminHeader.tsx](cci:7://file:///C:/Users/User/Documents/GitHub/WebShardow/THOTH%20V2/components/admin/AdminHeader.tsx:0:0-0:0) - Header with user info
- [StatCard.tsx](cci:7://file:///C:/Users/User/Documents/GitHub/WebShardow/THOTH%20V2/components/admin/StatCard.tsx:0:0-0:0) - Dashboard stat cards
- [admin/layout.tsx](cci:7://file:///C:/Users/User/Documents/GitHub/WebShardow/THOTH%20V2/app/admin/layout.tsx:0:0-0:0) - Protected admin layout
- [admin/page.tsx](cci:7://file:///C:/Users/User/Documents/GitHub/WebShardow/THOTH%20V2/app/admin/page.tsx:0:0-0:0) - Modern dashboard with stats

**6. Python Automation Scripts**
- `run-dev.py` - Start database + dev server automatically
- `run-pro.py` - Start database + production server
- `stop.py` - Stop all servers and database
- Auto-detects existing PostgreSQL container
- Waits for database to be ready before starting server

**7. Styling ([app/globals.css](cci:7://file:///C:/Users/User/Documents/GitHub/WebShardow/THOTH%20V2/app/globals.css:0:0-0:0))**
- Glass-morphism design system
- Gradient accents
- Custom Tailwind v4 theme
- Animation utilities

### สถาปัตยกรรมหลัก:

| ฟีเจอร์ | THOTH V1 | THOTH V2 |
|---------|----------|----------|
| Middleware | ใช้ middleware | **No middleware** (ใช้ proxy pattern) |
| Next.js | v16 (เก่า) | **v16** (modern) |
| UI | Bootstrap | **Glass-morphism + Tailwind v4** |
| Auth | Google only | **Google + Credentials + Registration** |
| Roles | ไม่มี | **admin/editor/user** |
| Posts | ไม่มี | **มี Post model** |
| Menu | Flat | **Hierarchical** |
| API | Basic | **Full REST with filters** |
| Database Startup | Manual | **Python scripts auto-start** |

### วิธีใช้งาน:

#### 1. ติดตั้งและรัน (ใช้สคริปต์)
```bash
cd "C:\Users\User\Documents\GitHub\WebShardow\THOTH V2"
# Windows
install.bat
# หรือ Linux/macOS
python install.py
```

#### 2. ติดตั้งแบบ Manual
```bash
cd "C:\Users\User\Documents\GitHub\WebShardow\THOTH V2"
npm install
npx prisma db push --force-reset
npx prisma db seed
npm run dev
```

### 🎁 Seed Data (Test Accounts)

รันคำสั่ง `npx prisma db seed` จะได้:

| Email | Password | Role |
|-------|----------|------|
| `admin@thoth.local` | `admin123` | **admin** |
| `editor@thoth.local` | `editor123` | **editor** |

**Sample Data:**
- 2 Categories (Web Development, Mobile Apps)
- 1 Page (About Us)
- 1 Project (Sample Project)

### 🛠️ Prisma Studio - Database GUI

เปิดดู/แก้ไขข้อมูลฐานข้อมูลแบบ GUI:
```bash
npx prisma studio
```
เปิดที่: http://localhost:5555

**ใช้ทำอะไรได้:**
- ดู/เพิ่ม/ลบ/แก้ไข Users
- จัดการ Content (Projects, Pages, Posts)
- แก้ไข Site Config
- ดู Session และ Account

### ลิงก์ที่ใช้บ่อย

| ลิงก์ | คำอธิบาย |
|-------|----------|
| http://localhost:3000/login | หน้า Login |
| http://localhost:3000/admin | แดชบอร์ด Admin |
| http://localhost:3000/api/projects | API ดู Projects |
| http://localhost:5555 | Prisma Studio |

### Next.js 16 Breaking Changes

#### Async searchParams
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

#### Auth Session Callback
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

### สรุปไฟล์ที่สร้าง (ทั้งหมด 25+ ไฟล์)

| หมวดหมู่ | จำนวน | ไฟล์หลัก |
|---------|-------|---------|
| Database | 1 | `prisma/schema.prisma` |
| Data Layer | 8 | `lib/data/*.ts` + `index.ts` |
| API Routes | 14 | `app/api/**/route.ts` |
| Admin Components | 3 | `components/admin/*.tsx` |
| Admin Layout | 2 | `app/admin/layout.tsx`, `page.tsx` |
| Auth | 1 | `auth.ts` (อัปเดต) |
| Styles | 1 | `app/globals.css` |
| Install Scripts | 3 | `install.bat`, `install.py`, `install.sh` |
| Python Scripts | 3 | `run-dev.py`, `run-pro.py`, `stop.py` |
| Seed | 1 | `prisma/seed.ts` |

ไฟล์สำคัญทั้งหมดอยู่ใน `C:\Users\User\Documents\GitHub\WebShardow\THOTH V2`





## Query Parameters

### Filtering
- `?published=true` - Show only published items
- `?featured=true` - Show only featured items
- `?categoryId=xxx` - Filter by category
- `?tag=xxx` - Filter by tag (posts only)

### Menu
- `?hierarchical=true` - Get nested menu structure

## Authentication

### Google OAuth
Configured via environment variables:
```
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
```

### Credentials (Email/Password)
Users can sign in with email/password. Passwords are hashed with bcryptjs.

### Roles
- **admin**: Full access to all features
- **editor**: Can create/edit content, but not delete
- **user**: Read-only access to dashboard

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/thoth_dev"

# Auth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# App
NODE_ENV="development"
```

**Note**: Default database uses port 5433 with credentials `postgres/postgres`