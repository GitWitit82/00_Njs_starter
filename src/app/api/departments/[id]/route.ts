import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const GET = async (
  request: Request,
  context: { params: { id: string } }
) => {
  try {
    const department = await prisma.department.findUnique({
      where: { id: context.params.id }
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

export const PUT = async (
  request: Request,
  context: { params: { id: string } }
) => {
  try {
    const { name, color } = await request.json()
    const department = await prisma.department.update({
      where: { id: context.params.id },
      data: { name, color }
    })
    return NextResponse.json(department)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export const DELETE = async (
  request: Request,
  context: { params: { id: string } }
) => {
  try {
    await prisma.department.delete({
      where: { id: context.params.id }
    })
    return NextResponse.json({ message: "Department deleted successfully" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 