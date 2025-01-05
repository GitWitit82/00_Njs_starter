import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

const departmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color"),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const departments = await db.department.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(departments)
  } catch (error) {
    console.error("[DEPARTMENTS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const json = await request.json()
    const body = departmentSchema.parse(json)

    // Check if department with same name already exists
    const existingDepartment = await db.department.findFirst({
      where: {
        name: body.name,
      },
    })

    if (existingDepartment) {
      return new NextResponse(
        JSON.stringify({
          error: "A department with this name already exists",
        }),
        { status: 400 }
      )
    }

    const department = await db.department.create({
      data: {
        name: body.name,
        description: body.description,
        color: body.color,
      },
    })

    return NextResponse.json(department)
  } catch (error) {
    console.error("[DEPARTMENTS_POST]", error)
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: error.errors[0].message }), {
        status: 400,
      })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
} 