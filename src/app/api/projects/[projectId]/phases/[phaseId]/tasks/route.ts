import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/lib/auth"

const taskSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  manHours: z.number().min(0.25, "Minimum 0.25 hours required"),
  order: z.number().int().min(0),
  departmentId: z.string().optional(),
  assignedToId: z.string().optional(),
  scheduledStart: z.string().optional().transform((str) => str ? new Date(str) : null),
  scheduledEnd: z.string().optional().transform((str) => str ? new Date(str) : null),
})

export async function GET(
  request: Request,
  { params }: { params: { projectId: string; phaseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const tasks = await db.projectTask.findMany({
      where: { projectPhaseId: params.phaseId },
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
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("[PROJECT_PHASE_TASKS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { projectId: string; phaseId: string } }
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

    // Only allow manager or admin to create tasks
    if (
      project.managerId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const json = await request.json()
    const body = taskSchema.parse(json)

    // Check if phase exists
    const phase = await db.projectPhase.findFirst({
      where: {
        id: params.phaseId,
        projectId: params.projectId,
      },
    })

    if (!phase) {
      return new NextResponse("Phase not found", { status: 404 })
    }

    // Check if department exists if provided
    if (body.departmentId) {
      const department = await db.department.findUnique({
        where: { id: body.departmentId },
      })

      if (!department) {
        return new NextResponse("Department not found", { status: 404 })
      }
    }

    // Check if user exists if assigned
    if (body.assignedToId) {
      const user = await db.user.findUnique({
        where: { id: body.assignedToId },
      })

      if (!user) {
        return new NextResponse("User not found", { status: 404 })
      }
    }

    // If order is provided, shift existing tasks
    if (body.order !== undefined) {
      await db.projectTask.updateMany({
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

    const task = await db.projectTask.create({
      data: {
        name: body.name,
        description: body.description,
        priority: body.priority,
        manHours: body.manHours,
        order: body.order,
        departmentId: body.departmentId,
        assignedToId: body.assignedToId,
        scheduledStart: body.scheduledStart,
        scheduledEnd: body.scheduledEnd,
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
    console.error("[PROJECT_PHASE_TASKS_POST]", error)
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: error.errors[0].message }), {
        status: 400,
      })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
} 