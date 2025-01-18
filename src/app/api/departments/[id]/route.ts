import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"

async function checkAuth(requiredRole?: Role) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  if (requiredRole && session.user.role !== requiredRole) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  return null
}

export async function GET(request: Request) {
  const authError = await checkAuth(Role.USER)
  if (authError) return authError

  try {
    const id = request.url.split("/").pop()
    const department = await prisma.department.findUnique({
      where: { id }
    })

    if (!department) {
      return NextResponse.json({ message: "Department not found" }, { status: 404 })
    }

    return NextResponse.json(department)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const authError = await checkAuth(Role.ADMIN)
  if (authError) return authError

  try {
    const id = request.url.split("/").pop()
    const { name, color } = await request.json()
    const department = await prisma.department.update({
      where: { id },
      data: { name, color }
    })
    return NextResponse.json(department)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const authError = await checkAuth(Role.ADMIN)
  if (authError) return authError

  try {
    const id = request.url.split("/").pop()
    await prisma.department.delete({
      where: { id }
    })
    return NextResponse.json({ message: "Department deleted successfully" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 