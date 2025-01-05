import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

// Schema for phase update
const phaseUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  order: z.number().int().min(0).optional(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "ON_HOLD"]).optional(),
})

/**
 * PUT /api/projects/[projectId]/phases/[id]
 * Update a phase
 */
export async function PUT(
  request: Request,
  { params }: { params: { projectId: string; id: string } }
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

    // Only allow manager or admin to update phases
    if (
      project.managerId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const json = await request.json()
    const body = phaseUpdateSchema.parse(json)

    // If order is changed, handle reordering
    if (body.order !== undefined) {
      const currentPhase = await prisma.projectPhase.findUnique({
        where: { id: params.id },
        select: { order: true },
      })

      if (currentPhase && currentPhase.order !== body.order) {
        // Moving down
        if (body.order > currentPhase.order) {
          await prisma.projectPhase.updateMany({
            where: {
              projectId: params.projectId,
              order: {
                gt: currentPhase.order,
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
          await prisma.projectPhase.updateMany({
            where: {
              projectId: params.projectId,
              order: {
                gte: body.order,
                lt: currentPhase.order,
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
    }

    const phase = await prisma.projectPhase.update({
      where: { id: params.id },
      data: body,
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
    })

    // Calculate phase progress
    const totalTasks = phase.tasks.length
    const completedTasks = phase.tasks.filter(
      (task) => task.status === "COMPLETED"
    ).length
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    return NextResponse.json({
      ...phase,
      progress: Math.round(progress),
      _count: {
        tasks: totalTasks,
        completedTasks,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 422 })
    }

    console.error("[PHASE_PUT]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

/**
 * DELETE /api/projects/[projectId]/phases/[id]
 * Delete a phase
 */
export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string; id: string } }
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

    // Only allow manager or admin to delete phases
    if (
      project.managerId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const phase = await prisma.projectPhase.findUnique({
      where: { id: params.id },
      select: { order: true },
    })

    if (!phase) {
      return new NextResponse("Phase not found", { status: 404 })
    }

    // Delete the phase
    await prisma.projectPhase.delete({
      where: { id: params.id },
    })

    // Reorder remaining phases
    await prisma.projectPhase.updateMany({
      where: {
        projectId: params.projectId,
        order: {
          gt: phase.order,
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
    console.error("[PHASE_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 