import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth-utils"

/**
 * PUT /api/workflows/[workflowId]/phases/[phaseId]/tasks/reorder
 * Reorder tasks within a phase
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

    const { params } = context
    const workflowId = params?.workflowId
    const phaseId = params?.phaseId

    if (!workflowId || !phaseId) {
      return new NextResponse("Missing required parameters", { status: 400 })
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
        id: phaseId,
        workflowId,
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
            phaseId,
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
        id: phaseId,
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