import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth-utils"

/**
 * PUT /api/workflows/[workflowId]/phases/reorder
 * Reorder phases
 */
export async function PUT(
  req: Request,
  context: { params: { workflowId: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || !["ADMIN", "MANAGER"].includes(user.role)) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const { params } = context
    const workflowId = params?.workflowId

    if (!workflowId) {
      return new NextResponse("Missing required parameters", { status: 400 })
    }

    const body = await req.json()
    const { phases } = body

    if (!Array.isArray(phases)) {
      return NextResponse.json(
        { error: "Invalid phases array" },
        { status: 400 }
      )
    }

    // Check if workflow exists
    const workflow = await db.workflow.findUnique({
      where: {
        id: workflowId,
      },
    })

    if (!workflow) {
      return new NextResponse("Workflow not found", { status: 404 })
    }

    // Update all phases in a transaction
    await db.$transaction(
      phases.map((phase) =>
        db.phase.update({
          where: {
            id: phase.id,
            workflowId,
          },
          data: {
            order: phase.order,
          },
        })
      )
    )

    // Fetch updated workflow with phases
    const updatedWorkflow = await db.workflow.findUnique({
      where: {
        id: workflowId,
      },
      include: {
        phases: {
          orderBy: {
            order: "asc",
          },
        },
      },
    })

    return NextResponse.json(updatedWorkflow)
  } catch (error) {
    if (error instanceof Error) {
      console.error("[PHASES_REORDER]", error.message)
    }
    return new NextResponse("Internal error", { status: 500 })
  }
} 