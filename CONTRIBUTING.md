# Contributing Guidelines

## Project Rules

### 🚫 **IMPORTANT: No Middleware Usage**
**This project strictly prohibits the use of Next.js middleware.**

- **DO NOT** use `middleware.ts` files
- **DO NOT** use Next.js middleware for route protection
- **DO NOT** use middleware for authentication or authorization

### ✅ **Alternative: Use Proxy Pattern**
Instead of middleware, use one of these approaches:

1. **Server-side Authentication Checks** (Current approach):
   ```typescript
   // lib/auth-utils.ts
   export async function requireAuth() {
     const session = await auth()
     if (!session?.user) {
       redirect("/login")
     }
     return session
   }

   // app/dashboard/page.tsx
   export default async function DashboardPage() {
     const session = await requireAuth()
     // ... rest of component
   }
   ```

2. **Proxy Components**:
   ```typescript
   // components/auth-proxy.tsx
   export function AuthProxy({ children, requiredRole }: {
     children: React.ReactNode
     requiredRole?: string
   }) {
     const session = useSession()
     
     if (!session) {
       return <div>Access denied</div>
     }
     
     if (requiredRole && session.user.role !== requiredRole) {
       return <div>Insufficient permissions</div>
     }
     
     return <>{children}</>
   }
   ```

3. **Layout-based Protection**:
   ```typescript
   // app/(auth)/layout.tsx
   export default async function AuthLayout({
     children,
   }: {
     children: React.ReactNode
   }) {
     const session = await requireAuth()
     return <>{children}</>
   }
   ```

## Code Style Guidelines

### Authentication & Authorization
- Always use server-side authentication checks
- Implement role-based access control in page components
- Use `requireAuth()` and `requireAdmin()` utilities from `lib/auth-utils.ts`

### Database Operations
- Use Prisma for all database operations
- Always use server components for database queries
- Implement proper error handling

### Styling
- Use Tailwind CSS classes
- Follow mobile-first responsive design
- Use consistent spacing and color scheme

### TypeScript
- Use strict TypeScript configuration
- Provide proper type definitions
- Avoid `any` types

## Development Workflow

1. **Setup Development Environment**
   - Follow README.md instructions
   - Ensure Docker is running for database
   - Install dependencies with `pnpm install`

2. **Making Changes**
   - Create feature branches
   - Test authentication flows
   - Verify mobile responsiveness
   - Check database operations

3. **Testing**
   - Test all authentication scenarios
   - Verify role-based access control
   - Test on mobile devices
   - Check database constraints

4. **Code Review Checklist**
   - [ ] No middleware usage
   - [ ] Server-side authentication checks
   - [ ] Proper TypeScript types
   - [ ] Mobile-responsive design
   - [ ] Database operations use Prisma
   - [ ] Error handling implemented

## Architecture Decisions

### Why No Middleware?
- Performance: Server-side checks are more efficient
- Security: Direct database access without middleware overhead
- Simplicity: Clearer code flow and easier debugging
- Flexibility: More granular control over authentication

### Authentication Flow
1. User visits protected route
2. Server component checks authentication
3. If not authenticated, redirect to login
4. After login, redirect back to intended route
5. Check role permissions if required

### Database Schema Rules
- All tables must have proper relationships
- Use Prisma migrations for schema changes
- Include audit fields (createdAt, updatedAt)
- Implement proper constraints

## File Structure

```
app/
├── (auth)/           # Protected routes
├── api/             # API routes
├── dashboard/       # User dashboard
├── admin/          # Admin panel
└── login/          # Authentication pages

lib/
├── auth-utils.ts   # Authentication utilities
├── prisma.ts      # Database client
└── ...           # Other utilities

components/
├── ui/            # UI components
└── ...           # Feature components
```

## Security Guidelines

### Authentication
- Always verify session on server-side
- Use HTTPS in production
- Implement proper session management
- Validate user input

### Database
- Use parameterized queries (Prisma handles this)
- Implement proper user permissions
- Never expose sensitive data
- Use environment variables for secrets

### API Security
- Validate all inputs
- Implement rate limiting
- Use proper HTTP methods
- Handle errors gracefully

## Common Patterns

### Protected Page
```typescript
import { requireAuth } from "@/lib/auth-utils"

export default async function ProtectedPage() {
  const session = await requireAuth()
  
  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      {/* Page content */}
    </div>
  )
}
```

### Admin-Only Page
```typescript
import { requireAdmin } from "@/lib/auth-utils"

export default async function AdminPage() {
  const session = await requireAdmin()
  
  return (
    <div>
      <h1>Admin Panel</h1>
      {/* Admin content */}
    </div>
  )
}
```

### Role-Based Content
```typescript
export default function PageWithRoleContent({ session }: { session: Session }) {
  return (
    <div>
      {session.user.role === "admin" && (
        <AdminContent />
      )}
      <UserContent />
    </div>
  )
}
```

## Getting Help

- Check existing issues before creating new ones
- Provide detailed error descriptions
- Include steps to reproduce
- Mention environment details

## License

By contributing to this project, you agree to follow the project rules and guidelines.
