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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const department = await db.department.findUnique({
      where: { id: params.id },
    })

    if (!department) {
      return new NextResponse("Department not found", { status: 404 })
    }

    return NextResponse.json(department)
  } catch (error) {
    console.error("[DEPARTMENT_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if department exists
    const existingDepartment = await db.department.findUnique({
      where: { id: params.id },
    })

    if (!existingDepartment) {
      return new NextResponse("Department not found", { status: 404 })
    }

    // Check if name is taken by another department
    if (body.name !== existingDepartment.name) {
      const nameExists = await db.department.findFirst({
        where: {
          name: body.name,
          NOT: { id: params.id },
        },
      })

      if (nameExists) {
        return new NextResponse(
          JSON.stringify({
            error: "A department with this name already exists",
          }),
          { status: 400 }
        )
      }
    }

    const department = await db.department.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description,
        color: body.color,
      },
    })

    return NextResponse.json(department)
  } catch (error) {
    console.error("[DEPARTMENT_PUT]", error)
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: error.errors[0].message }), {
        status: 400,
      })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Check if department exists
    const department = await db.department.findUnique({
      where: { id: params.id },
      include: {
        workflowTasks: true,
        projectTasks: true,
      },
    })

    if (!department) {
      return new NextResponse("Department not found", { status: 404 })
    }

    // Check if department has any tasks
    if (department.workflowTasks.length > 0 || department.projectTasks.length > 0) {
      return new NextResponse(
        JSON.stringify({
          error: "Cannot delete department with associated tasks",
        }),
        { status: 400 }
      )
    }

    await db.department.delete({
      where: { id: params.id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[DEPARTMENT_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 