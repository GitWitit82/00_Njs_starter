import { NextResponse } from "next/server"
import { z } from "zod"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth-utils"

const taskSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  manHours: z.number().min(0.25).step(0.25),
})

/**
 * GET /api/workflows/[workflowId]/phases/[phaseId]/tasks
 * Get all tasks for a phase
 */
export async function GET(
  req: Request,
  context: { params: { workflowId: string; phaseId: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || !["ADMIN", "MANAGER"].includes(user.role)) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const params = await context.params
    const { workflowId, phaseId } = params

    if (!workflowId || !phaseId) {
      return new NextResponse("Missing required parameters", { status: 400 })
    }

    const tasks = await db.task.findMany({
      where: {
        phaseId,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    if (error instanceof Error) {
      console.error("[TASKS_GET]", error.message)
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

/**
 * POST /api/workflows/[workflowId]/phases/[phaseId]/tasks
 * Create a new task
 */
export async function POST(
  req: Request,
  context: { params: { workflowId: string; phaseId: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || !["ADMIN", "MANAGER"].includes(user.role)) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const params = await context.params
    const { workflowId, phaseId } = params

    if (!workflowId || !phaseId) {
      return new NextResponse("Missing required parameters", { status: 400 })
    }

    const json = await req.json()
    const body = taskSchema.parse(json)

    const task = await db.task.create({
      data: {
        ...body,
        phaseId,
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 })
    }

    if (error instanceof Error) {
      console.error("[TASKS_POST]", error.message)
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

/**
 * PUT /api/workflows/[workflowId]/phases/[phaseId]/tasks/reorder
 * Reorder tasks
 */
export async function PUT(
  req: Request,
  context: { params: { workflowId: string; phaseId: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || !["ADMIN", "MANAGER"].includes(user.role)) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const params = await context.params
    const { workflowId, phaseId } = params

    if (!workflowId || !phaseId) {
      return new NextResponse("Missing required parameters", { status: 400 })
    }

    const json = await req.json()
    const { tasks } = json

    const transaction = tasks.map((task: { id: string; order: number }) =>
      db.task.update({
        where: {
          id: task.id,
          phaseId,
        },
        data: {
          order: task.order,
        },
      })
    )

    await db.$transaction(transaction)

    const updatedTasks = await db.task.findMany({
      where: {
        phaseId,
      },
      orderBy: {
        order: "asc",
      },
    })

    return NextResponse.json(updatedTasks)
  } catch (error) {
    if (error instanceof Error) {
      console.error("[TASKS_REORDER]", error.message)
    }
    return new NextResponse("Internal error", { status: 500 })
  }
} 