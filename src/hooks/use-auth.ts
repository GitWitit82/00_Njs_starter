"use client"

import { useSession } from "next-auth/react"
import { Role } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface UseAuthProps {
  requiredRole?: Role
}

export function useAuth({ requiredRole }: UseAuthProps = {}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isAuthenticated = status === "authenticated"
  const isLoading = status === "loading"
  const user = session?.user

  const checkRole = (role: Role): boolean => {
    if (!user?.role) return false

    switch (role) {
      case "ADMIN":
        return user.role === "ADMIN"
      case "MANAGER":
        return ["ADMIN", "MANAGER"].includes(user.role as Role)
      case "USER":
        return ["ADMIN", "MANAGER", "USER"].includes(user.role as Role)
      default:
        return false
    }
  }

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/auth/login")
      } else if (requiredRole && !checkRole(requiredRole)) {
        router.push("/unauthorized")
      }
    }
  }, [isLoading, isAuthenticated, requiredRole, router])

  return {
    user,
    isAuthenticated,
    isLoading,
    checkRole,
  }
} 