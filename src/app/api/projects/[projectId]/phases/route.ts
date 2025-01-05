import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

// Schema for phase creation/update
const phaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  order: z.number().int().min(0),
})

/**
 * GET /api/projects/[projectId]/phases
 * Get all phases for a project
 */
export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const project = await prisma.project.findUnique({
      where: { id: params.projectId },
      select: { id: true },
    })

    if (!project) {
      return new NextResponse("Project not found", { status: 404 })
    }

    const phases = await prisma.projectPhase.findMany({
      where: { projectId: params.projectId },
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
      orderBy: { order: "asc" },
    })

    // Calculate progress for each phase
    const phasesWithProgress = phases.map((phase) => {
      const totalTasks = phase.tasks.length
      const completedTasks = phase.tasks.filter(
        (task) => task.status === "COMPLETED"
      ).length
      const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

      return {
        ...phase,
        progress: Math.round(progress),
        _count: {
          tasks: totalTasks,
          completedTasks,
        },
      }
    })

    return NextResponse.json(phasesWithProgress)
  } catch (error) {
    console.error("[PHASES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

/**
 * POST /api/projects/[projectId]/phases
 * Create a new phase in the project
 */
export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
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

    // Only allow manager or admin to add phases
    if (
      project.managerId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const json = await request.json()
    const body = phaseSchema.parse(json)

    // If order is specified, shift existing phases
    if (body.order !== undefined) {
      await prisma.projectPhase.updateMany({
        where: {
          projectId: params.projectId,
          order: {
            gte: body.order,
          },
        },
        data: {
          order: {
            increment: 1,
          },
        },
      })
    }

    const phase = await prisma.projectPhase.create({
      data: {
        ...body,
        projectId: params.projectId,
      },
      include: {
        tasks: true,
      },
    })

    return NextResponse.json(phase)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 422 })
    }

    console.error("[PHASES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 