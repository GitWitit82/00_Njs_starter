import { NextResponse } from "next/server"
import { z } from "zod"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth-utils"

/**
 * GET /api/workflows/[workflowId]/phases/[phaseId]
 * Get a specific phase
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

    const phase = await db.phase.findUnique({
      where: {
        id: phaseId,
        workflowId,
      },
      include: {
        workflow: true,
        tasks: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    })

    if (!phase) {
      return new NextResponse("Phase not found", { status: 404 })
    }

    return NextResponse.json(phase)
  } catch (error) {
    if (error instanceof Error) {
      console.error("[PHASE_GET]", error.message)
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

/**
 * PUT /api/workflows/[workflowId]/phases/[phaseId]
 * Update a phase
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
    const { name, description } = json

    const phase = await db.phase.update({
      where: {
        id: phaseId,
        workflowId,
      },
      data: {
        name,
        description,
      },
      include: {
        workflow: true,
        tasks: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    })

    return NextResponse.json(phase)
  } catch (error) {
    if (error instanceof Error) {
      console.error("[PHASE_UPDATE]", error.message)
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

/**
 * DELETE /api/workflows/[workflowId]/phases/[phaseId]
 * Delete a phase
 */
export async function DELETE(
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

    await db.phase.delete({
      where: {
        id: phaseId,
        workflowId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof Error) {
      console.error("[PHASE_DELETE]", error.message)
    }
    return new NextResponse("Internal error", { status: 500 })
  }
} 