import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

// Schema for project update
const projectUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  status: z.enum(["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"]).optional(),
  startDate: z.string().transform((str) => new Date(str)).optional(),
  endDate: z.string().optional().transform((str) => (str ? new Date(str) : undefined)),
  managerId: z.string().optional(),
})

/**
 * GET /api/projects/[id]
 * Get project details
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        workflow: true,
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

    // Calculate project progress
    const totalTasks = project.phases.reduce(
      (acc, phase) => acc + phase.tasks.length,
      0
    )
    const completedTasks = project.phases.reduce(
      (acc, phase) =>
        acc +
        phase.tasks.filter((task) => task.status === "COMPLETED").length,
      0
    )
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    return NextResponse.json({
      ...project,
      progress: Math.round(progress),
      _count: {
        tasks: totalTasks,
        completedTasks,
      },
    })
  } catch (error) {
    console.error("[PROJECT_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

/**
 * PUT /api/projects/[id]
 * Update project details
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await request.json()
    const body = projectUpdateSchema.parse(json)

    const project = await prisma.project.findUnique({
      where: { id: params.id },
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

    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: body,
      include: {
        workflow: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        phases: {
          include: {
            tasks: true,
          },
        },
      },
    })

    return NextResponse.json(updatedProject)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 422 })
    }

    console.error("[PROJECT_PUT]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

/**
 * DELETE /api/projects/[id]
 * Delete a project
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
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

    await prisma.project.delete({
      where: { id: params.id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[PROJECT_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 