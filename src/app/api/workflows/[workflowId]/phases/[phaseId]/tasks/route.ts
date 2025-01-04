import { NextResponse } from "next/server"
import { z } from "zod"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth-utils"

const taskSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  manHours: z.number().min(0).optional(),
})

/**
 * POST /api/workflows/[workflowId]/phases/[phaseId]/tasks
 * Create a new task
 */
export async function POST(
  req: Request,
  { params }: { params: { workflowId: string; phaseId: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const body = await req.json()
    const validatedFields = taskSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", issues: validatedFields.error.issues },
        { status: 400 }
      )
    }

    const { name, description, priority, manHours } = validatedFields.data

    // Check if phase exists and belongs to the workflow
    const phase = await db.phase.findUnique({
      where: {
        id: params.phaseId,
        workflowId: params.workflowId,
      },
      include: {
        tasks: {
          orderBy: {
            id: "desc",
          },
          take: 1,
        },
      },
    })

    if (!phase) {
      return new NextResponse("Phase not found", { status: 404 })
    }

    const task = await db.task.create({
      data: {
        name,
        description,
        priority,
        manHours,
        phaseId: params.phaseId,
      },
    })

    return NextResponse.json(task)
  } catch (error) {
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
  { params }: { params: { workflowId: string; phaseId: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const body = await req.json()
    const { tasks } = body

    if (!Array.isArray(tasks)) {
      return NextResponse.json(
        { error: "Invalid tasks array" },
        { status: 400 }
      )
    }

    // Check if phase exists and belongs to the workflow
    const phase = await db.phase.findUnique({
      where: {
        id: params.phaseId,
        workflowId: params.workflowId,
      },
    })

    if (!phase) {
      return new NextResponse("Phase not found", { status: 404 })
    }

    // Update all tasks in a transaction
    await db.$transaction(
      tasks.map((task) =>
        db.task.update({
          where: {
            id: task.id,
            phaseId: params.phaseId,
          },
          data: {
            order: task.order,
          },
        })
      )
    )

    // Fetch updated phase with tasks
    const updatedPhase = await db.phase.findUnique({
      where: {
        id: params.phaseId,
      },
      include: {
        tasks: {
          orderBy: {
            order: "asc",
          },
        },
      },
    })

    return NextResponse.json(updatedPhase)
  } catch (error) {
    if (error instanceof Error) {
      console.error("[TASKS_REORDER]", error.message)
    }
    return new NextResponse("Internal error", { status: 500 })
  }
} 