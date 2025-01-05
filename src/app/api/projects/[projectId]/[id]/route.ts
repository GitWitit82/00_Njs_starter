import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/lib/auth"

const projectUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  status: z.enum(["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"]),
  managerId: z.string(),
})

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const project = await db.project.findUnique({
      where: { id: params.projectId },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        phases: {
          orderBy: { order: "asc" },
          include: {
            tasks: {
              orderBy: { order: "asc" },
              include: {
                department: true,
                assignedTo: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!project) {
      return new NextResponse("Project not found", { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("[PROJECT_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const project = await db.project.findUnique({
      where: { id: params.projectId },
      select: { managerId: true },
    })

    if (!project) {
      return new NextResponse("Project not found", { status: 404 })
    }

    // Only allow manager or admin to update project
    if (
      project.managerId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const json = await request.json()
    const body = projectUpdateSchema.parse(json)

    const updatedProject = await db.project.update({
      where: { id: params.projectId },
      data: {
        name: body.name,
        description: body.description,
        status: body.status,
        managerId: body.managerId,
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        phases: {
          orderBy: { order: "asc" },
          include: {
            tasks: {
              orderBy: { order: "asc" },
              include: {
                department: true,
                assignedTo: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error("[PROJECT_PUT]", error)
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
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const project = await db.project.findUnique({
      where: { id: params.projectId },
      select: { managerId: true },
    })

    if (!project) {
      return new NextResponse("Project not found", { status: 404 })
    }

    // Only allow manager or admin to delete project
    if (
      project.managerId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    await db.project.delete({
      where: { id: params.projectId },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[PROJECT_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 