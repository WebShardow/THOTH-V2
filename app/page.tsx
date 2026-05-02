import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="z-10 max-w-4xl w-full text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
          Welcome to Our Platform
        </h1>
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-12">
          Build amazing things with our powerful tools
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="text-lg px-6 py-4 sm:px-8 sm:py-6 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              Login
            </Button>
          </Link>
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="text-lg px-6 py-4 sm:px-8 sm:py-6 w-full sm:w-auto border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
