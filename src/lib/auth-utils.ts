import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"

/**
 * Get the current session on the server side
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

/**
 * Check if the current user has the required role
 * @param requiredRole - The role required to access the resource
 */
export async function checkUserRole(requiredRole: Role) {
  const user = await getCurrentUser()
  if (!user) return false

  switch (requiredRole) {
    case "ADMIN":
      return user.role === "ADMIN"
    case "MANAGER":
      return ["ADMIN", "MANAGER"].includes(user.role)
    case "USER":
      return ["ADMIN", "MANAGER", "USER"].includes(user.role)
    default:
      return false
  }
}

/**
 * Higher-order function to protect API routes based on roles
 * @param handler - The API route handler
 * @param requiredRole - The role required to access the route
 */
export function withRoleProtection(handler: Function, requiredRole: Role) {
  return async (req: Request, ...args: any[]) => {
    const user = await getCurrentUser()
    
    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const hasAccess = await checkUserRole(requiredRole)
    if (!hasAccess) {
      return new Response("Forbidden", { status: 403 })
    }

    return handler(req, ...args)
  }
} 