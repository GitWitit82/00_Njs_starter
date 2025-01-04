"use client"

import { useEffect, useState } from "react"
import { Role } from "@prisma/client"

import { useAuth } from "@/hooks/use-auth"
import { UsersTable } from "@/components/users/users-table"

interface User {
  id: string
  name: string
  email: string
  role: Role
  createdAt: Date
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { user, isAuthenticated } = useAuth({ requiredRole: "ADMIN" })

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/users")
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers()
    }
  }, [isAuthenticated])

  if (isLoading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading users...</h2>
          <p className="text-sm text-muted-foreground">
            Please wait while we fetch the user data.
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive">Error</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">
          Manage user accounts and permissions.
        </p>
      </div>

      <UsersTable users={users} onUserChange={fetchUsers} />
    </div>
  )
} 