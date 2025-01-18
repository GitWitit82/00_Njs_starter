import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"

export function RouteHandler<T>(
  handler: (request: NextRequest, params: T) => Promise<NextResponse>,
  requiredRole?: Role
) {
  return async (request: NextRequest, { params }: { params: T }) => {
    try {
      const session = await getServerSession(authOptions)
      if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
      }

      if (requiredRole && session.user.role !== requiredRole) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 })
      }

      return handler(request, params)
    } catch (error) {
      console.error(error)
      return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
  }
} 