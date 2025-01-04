import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { Role } from "@prisma/client"

/**
 * Route configuration for role-based access
 */
const routeConfig = {
  admin: ["/admin", "/users"],
  manager: ["/manager"],
  user: ["/dashboard"],
  public: ["/", "/auth/login", "/auth/register", "/api/auth"],
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
    return new NextResponse("Unauthorized", { status: 403 })
  }

  return NextResponse.next()
}

/**
 * Check if the user has access to the requested path
 * @param path - The requested path
 * @param role - The user's role
 */
function checkAuthorization(path: string, role: Role): boolean {
  switch (role) {
    case "ADMIN":
      return true // Admin has access to everything
    case "MANAGER":
      return !path.startsWith("/admin") // Manager has access to everything except admin routes
    case "USER":
      return routeConfig.user.some(route => path.startsWith(route)) // Users only have access to user routes
    default:
      return false
  }
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
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)",
  ],
} 