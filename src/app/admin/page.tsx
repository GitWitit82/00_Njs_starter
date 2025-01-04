"use client"

import { useAuth } from "@/hooks/use-auth"

/**
 * Protected admin page that requires ADMIN role
 */
export default function AdminPage() {
  const { user, isLoading } = useAuth("ADMIN")

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-600 dark:text-gray-300">
          Welcome, {user?.name || user?.email}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          You have admin privileges
        </p>
      </div>
    </div>
  )
} 