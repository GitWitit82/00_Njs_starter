import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth-utils"

/**
 * DELETE /api/workflows/[workflowId]/phases/[phaseId]
 * Delete a phase
 */
export async function DELETE(
  req: Request,
  { params }: { params: { workflowId: string; phaseId: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Check if phase exists and belongs to the workflow
    const phase = await db.phase.findUnique({
      where: {
        id: params.phaseId,
        workflowId: params.workflowId,
      },
      include: {
        tasks: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!phase) {
      return new NextResponse("Phase not found", { status: 404 })
    }

    // Check if phase has any tasks
    if (phase.tasks.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete phase with existing tasks. Please delete the tasks first.",
        },
        { status: 400 }
      )
    }

    // Delete the phase
    await db.phase.delete({
      where: {
        id: params.phaseId,
      },
    })

    // Reorder remaining phases
    const remainingPhases = await db.phase.findMany({
      where: {
        workflowId: params.workflowId,
      },
      orderBy: {
        order: "asc",
      },
    })

    // Update order in a transaction
    await db.$transaction(
      remainingPhases.map((phase, index) =>
        db.phase.update({
          where: {
            id: phase.id,
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
      console.error("[PHASE_DELETE]", error.message)
    }
    return new NextResponse("Internal error", { status: 500 })
  }
} 