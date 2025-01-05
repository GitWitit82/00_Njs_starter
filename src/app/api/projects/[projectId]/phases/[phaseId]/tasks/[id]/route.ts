import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

// Schema for task update
const taskUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "ON_HOLD", "BLOCKED"]).optional(),
  manHours: z.number().min(0.25, "Minimum 0.25 hours required").optional(),
  order: z.number().int().min(0).optional(),
  departmentId: z.string().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
  scheduledStart: z.string().optional().transform((str) => str ? new Date(str) : null),
  scheduledEnd: z.string().optional().transform((str) => str ? new Date(str) : null),
  actualStart: z.string().optional().transform((str) => str ? new Date(str) : null),
  actualEnd: z.string().optional().transform((str) => str ? new Date(str) : null),
  dependencies: z.array(z.string()).optional(),
})

/**
 * PUT /api/projects/[projectId]/phases/[phaseId]/tasks/[id]
 * Update a task
 */
export async function PUT(
  request: Request,
  { params }: { params: { projectId: string; phaseId: string; id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const project = await prisma.project.findUnique({
      where: { id: params.projectId },
      select: { managerId: true },
    })

    if (!project) {
      return new NextResponse("Project not found", { status: 404 })
    }

    const task = await prisma.projectTask.findFirst({
      where: {
        id: params.id,
        projectPhaseId: params.phaseId,
      },
    })

    if (!task) {
      return new NextResponse("Task not found", { status: 404 })
    }

    // Allow task updates by:
    // 1. Project manager
    // 2. Admin
    // 3. Assigned user (limited updates)
    const isManager = project.managerId === session.user.id
    const isAdmin = session.user.role === "ADMIN"
    const isAssigned = task.assignedToId === session.user.id

    if (!isManager && !isAdmin && !isAssigned) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const json = await request.json()
    const body = taskUpdateSchema.parse(json)

    // If not manager/admin, only allow updating status and actual times
    if (!isManager && !isAdmin) {
      const allowedUpdates = {
        status: body.status,
        actualStart: body.actualStart,
        actualEnd: body.actualEnd,
      }
      Object.keys(body).forEach((key) => {
        if (!(key in allowedUpdates)) {
          delete body[key]
        }
      })
    }

    // Handle order changes
    if (body.order !== undefined && body.order !== task.order) {
      // Moving down
      if (body.order > task.order) {
        await prisma.projectTask.updateMany({
          where: {
            projectPhaseId: params.phaseId,
            order: {
              gt: task.order,
              lte: body.order,
            },
          },
          data: {
            order: {
              decrement: 1,
            },
          },
        })
      }
      // Moving up
      else {
        await prisma.projectTask.updateMany({
          where: {
            projectPhaseId: params.phaseId,
            order: {
              gte: body.order,
              lt: task.order,
            },
          },
          data: {
            order: {
              increment: 1,
            },
          },
        })
      }
    }

    // Handle dependencies
    let dependencies = undefined
    if (body.dependencies) {
      dependencies = {
        set: [], // Clear existing dependencies
        connect: body.dependencies.map((id) => ({ id })),
      }
      delete body.dependencies
    }

    const updatedTask = await prisma.projectTask.update({
      where: { id: params.id },
      data: {
        ...body,
        ...(dependencies && { dependencies }),
      },
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
        dependencies: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        dependentOn: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 422 })
    }

    console.error("[TASK_PUT]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

/**
 * DELETE /api/projects/[projectId]/phases/[phaseId]/tasks/[id]
 * Delete a task
 */
export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string; phaseId: string; id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const project = await prisma.project.findUnique({
      where: { id: params.projectId },
      select: { managerId: true },
    })

    if (!project) {
      return new NextResponse("Project not found", { status: 404 })
    }

    // Only allow manager or admin to delete tasks
    if (
      project.managerId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const task = await prisma.projectTask.findFirst({
      where: {
        id: params.id,
        projectPhaseId: params.phaseId,
      },
      select: { order: true },
    })

    if (!task) {
      return new NextResponse("Task not found", { status: 404 })
    }

    // Delete the task
    await prisma.projectTask.delete({
      where: { id: params.id },
    })

    // Reorder remaining tasks
    await prisma.projectTask.updateMany({
      where: {
        projectPhaseId: params.phaseId,
        order: {
          gt: task.order,
        },
      },
      data: {
        order: {
          decrement: 1,
        },
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[TASK_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 