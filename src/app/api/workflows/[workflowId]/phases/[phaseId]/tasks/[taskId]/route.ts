import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth-utils"

/**
 * DELETE /api/workflows/[workflowId]/phases/[phaseId]/tasks/[taskId]
 * Delete a task
 */
export async function DELETE(
  req: Request,
  { params }: { params: { workflowId: string; phaseId: string; taskId: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Check if task exists and belongs to the phase
    const task = await db.task.findUnique({
      where: {
        id: params.taskId,
        phaseId: params.phaseId,
      },
    })

    if (!task) {
      return new NextResponse("Task not found", { status: 404 })
    }

    // Delete the task
    await db.task.delete({
      where: {
        id: params.taskId,
      },
    })

    // Reorder remaining tasks
    const remainingTasks = await db.task.findMany({
      where: {
        phaseId: params.phaseId,
      },
      orderBy: {
        order: "asc",
      },
    })

    // Update order in a transaction
    await db.$transaction(
      remainingTasks.map((task, index) =>
        db.task.update({
          where: {
            id: task.id,
          },
          data: {
            order: index,
          },
        })
      )
    )

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof Error) {
      console.error("[TASK_DELETE]", error.message)
    }
    return new NextResponse("Internal error", { status: 500 })
  }
} 