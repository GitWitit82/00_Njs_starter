"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

/**
 * Unauthorized access page
 */
export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Unauthorized Access
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          You don't have permission to access this page.
        </p>
        <div className="space-x-4">
          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
          >
            Go to Dashboard
          </Button>
          <Button
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
} 