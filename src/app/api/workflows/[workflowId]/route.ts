import { NextResponse } from "next/server"
import { z } from "zod"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth-utils"

/**
 * GET /api/workflows/[workflowId]
 * Get a workflow with its phases
 */
export async function GET(
  req: Request,
  context: { params: { workflowId: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || !["ADMIN", "MANAGER"].includes(user.role)) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const params = await context.params
    const { workflowId } = params

    if (!workflowId) {
      return new NextResponse("Missing required parameters", { status: 400 })
    }

    const workflow = await db.workflow.findUnique({
      where: {
        id: workflowId,
      },
      include: {
        phases: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            tasks: {
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        },
      },
    })

    if (!workflow) {
      return new NextResponse("Workflow not found", { status: 404 })
    }

    return NextResponse.json(workflow)
  } catch (error) {
    if (error instanceof Error) {
      console.error("[WORKFLOW_GET]", error.message)
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

/**
 * PUT /api/workflows/[workflowId]
 * Update a workflow
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

    const params = await context.params
    const { workflowId } = params

    if (!workflowId) {
      return new NextResponse("Missing required parameters", { status: 400 })
    }

    const body = await req.json()
    const { name, description } = body

    const workflow = await db.workflow.update({
      where: {
        id: workflowId,
      },
      data: {
        name,
        description,
      },
    })

    return NextResponse.json(workflow)
  } catch (error) {
    if (error instanceof Error) {
      console.error("[WORKFLOW_UPDATE]", error.message)
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

/**
 * DELETE /api/workflows/[workflowId]
 * Delete a workflow
 */
export async function DELETE(
  req: Request,
  context: { params: { workflowId: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || !["ADMIN", "MANAGER"].includes(user.role)) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const params = await context.params
    const { workflowId } = params

    if (!workflowId) {
      return new NextResponse("Missing required parameters", { status: 400 })
    }

    await db.workflow.delete({
      where: {
        id: workflowId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof Error) {
      console.error("[WORKFLOW_DELETE]", error.message)
    }
    return new NextResponse("Internal error", { status: 500 })
  }
} 