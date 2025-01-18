/**
 * @file Departments API Route
 * @description Handles API requests for departments
 */

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as z from "zod"

const departmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
})

/**
 * GET /api/departments
 * Retrieves all departments
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const departments = await prisma.department.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(departments)
  } catch (error) {
    console.error("[DEPARTMENTS_GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/departments
 * Creates a new department
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await request.json()
    const result = departmentSchema.safeParse(json)

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.errors },
        { status: 400 }
      )
    }

    const department = await prisma.department.create({
      data: {
        name: result.data.name,
        description: result.data.description,
        color: result.data.color,
      },
    })

    return NextResponse.json(department)
  } catch (error) {
    console.error("[DEPARTMENTS_POST]", error)
    return NextResponse.json(
      { error: "Failed to create department" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/departments/:id
 * Updates an existing department
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await request.json()
    const result = departmentSchema.safeParse(json)

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.errors },
        { status: 400 }
      )
    }

    const department = await prisma.department.update({
      where: { id: params.id },
      data: {
        name: result.data.name,
        description: result.data.description,
        color: result.data.color,
      },
    })

    return NextResponse.json(department)
  } catch (error) {
    console.error("[DEPARTMENTS_PATCH]", error)
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update department" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/departments/:id
 * Deletes a department
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.department.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Department deleted successfully" })
  } catch (error) {
    console.error("[DEPARTMENTS_DELETE]", error)
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: "Failed to delete department" },
      { status: 500 }
    )
  }
} 