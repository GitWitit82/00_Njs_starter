import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

// Schema for task creation
const taskSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  manHours: z.number().min(0.25, "Minimum 0.25 hours required"),
  order: z.number().int().min(0),
  departmentId: z.string().optional(),
  assignedToId: z.string().optional(),
})

/**
 * GET /api/projects/[projectId]/phases/[phaseId]/tasks
 * Get all tasks for a phase
 */
export async function GET(
  request: Request,
  { params }: { params: { projectId: string; phaseId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const phase = await prisma.projectPhase.findFirst({
      where: {
        id: params.phaseId,
        projectId: params.projectId,
      },
    })

    if (!phase) {
      return new NextResponse("Phase not found", { status: 404 })
    }

    const tasks = await prisma.projectTask.findMany({
      where: { projectPhaseId: params.phaseId },
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
      orderBy: { order: "asc" },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("[TASKS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

/**
 * POST /api/projects/[projectId]/phases/[phaseId]/tasks
 * Create a new task in the phase
 */
export async function POST(
  request: Request,
  { params }: { params: { projectId: string; phaseId: string } }
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

    // Only allow manager or admin to add tasks
    if (
      project.managerId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const phase = await prisma.projectPhase.findFirst({
      where: {
        id: params.phaseId,
        projectId: params.projectId,
      },
    })

    if (!phase) {
      return new NextResponse("Phase not found", { status: 404 })
    }

    const json = await request.json()
    const body = taskSchema.parse(json)

    // If order is specified, shift existing tasks
    if (body.order !== undefined) {
      await prisma.projectTask.updateMany({
        where: {
          projectPhaseId: params.phaseId,
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

    const task = await prisma.projectTask.create({
      data: {
        ...body,
        projectPhaseId: params.phaseId,
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
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 422 })
    }

    console.error("[TASKS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 