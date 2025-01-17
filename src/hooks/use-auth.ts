"use client"

import { useSession } from "next-auth/react"
import { Role } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useEffect, useCallback } from "react"

interface UseAuthProps {
  requiredRole?: Role
}

interface AuthUser {
  id: string
  name: string
  role: Role
}

interface UseAuthReturn {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  checkRole: (role: Role) => boolean
}

export function useAuth({ requiredRole }: UseAuthProps = {}): UseAuthReturn {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isAuthenticated = status === "authenticated"
  const isLoading = status === "loading"
  const user = session?.user as AuthUser | undefined

  const checkRole = useCallback((role: Role): boolean => {
    if (!user?.role) return false

    switch (role) {
      case "ADMIN":
        return user.role === "ADMIN"
      case "MANAGER":
        return ["ADMIN", "MANAGER"].includes(user.role)
      case "USER":
        return ["ADMIN", "MANAGER", "USER"].includes(user.role)
      default:
        return false
    }
  }, [user?.role])

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/auth/login")
      } else if (requiredRole && !checkRole(requiredRole)) {
        router.push("/unauthorized")
      }
    }
  }, [isLoading, isAuthenticated, requiredRole, router, checkRole])

  return {
    user: user ?? null,
    isAuthenticated,
    isLoading,
    checkRole,
  }
} 