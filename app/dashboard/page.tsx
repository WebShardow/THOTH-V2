import { auth, signOut } from "@/auth"
import { requireAuth } from "@/lib/auth-utils"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const session = await requireAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                {session.user.name || session.user.email}
              </span>
              <form
                action={async () => {
                  "use server"
                  await signOut({ redirectTo: "/" })
                }}
              >
                <Button type="submit" variant="destructive" size="sm">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Welcome, {session.user.name || "User"}!
          </h2>
          
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Profile Information</h3>
              <dl className="mt-2 space-y-2">
                <div className="flex flex-col sm:flex-row">
                  <dt className="text-sm font-medium text-gray-500 sm:w-32">Name:</dt>
                  <dd className="text-sm text-gray-900">{session.user.name || "Not set"}</dd>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <dt className="text-sm font-medium text-gray-500 sm:w-32">Email:</dt>
                  <dd className="text-sm text-gray-900">{session.user.email || "Not set"}</dd>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <dt className="text-sm font-medium text-gray-500 sm:w-32">Role:</dt>
                  <dd className="text-sm text-gray-900 capitalize">{session.user.role}</dd>
                </div>
              </dl>
            </div>

            {session.user.role === "admin" && (
              <div className="mt-6">
                <Button asChild className="w-full sm:w-auto">
                  <a href="/admin">Go to Admin Panel</a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
