import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { Role } from "@prisma/client"

/**
 * Route configuration for role-based access
 */
const routeConfig = {
  admin: ["/admin", "/users"],
  manager: ["/workflows", "/departments"],
  user: ["/dashboard", "/settings"],
  public: ["/", "/auth/login", "/auth/register", "/auth/error", "/api/auth"],
}

/**
 * Check if a user has access to a route based on their role
 */
function checkAuthorization(pathname: string, role: Role): boolean {
  // Admin has access to all routes
  if (role === "ADMIN") {
    return true
  }

  // Manager has access to manager and user routes
  if (role === "MANAGER") {
    return (
      routeConfig.manager.some(path => pathname.startsWith(path)) ||
      routeConfig.user.some(path => pathname.startsWith(path))
    )
  }

  // User has access to user routes only
  if (role === "USER") {
    return routeConfig.user.some(path => pathname.startsWith(path))
  }

  return false
}

/**
 * Middleware function to protect routes and implement RBAC
 * @param request - The incoming request
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is public
  if (routeConfig.public.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check for authentication token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Redirect to login if not authenticated
  if (!token) {
    const url = new URL("/auth/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(pathname))
    return NextResponse.redirect(url)
  }

  // Role-based access control
  const userRole = token.role as Role
  const isAuthorized = checkAuthorization(pathname, userRole)

  if (!isAuthorized) {
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }

  return NextResponse.next()
}

/**
 * Configure which routes should be handled by this middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. _next/static (static files)
     * 2. _next/image (image optimization files)
     * 3. favicon.ico (favicon file)
     * 4. public folder
     * 5. api/auth routes (handled by NextAuth)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)",
  ],
} 