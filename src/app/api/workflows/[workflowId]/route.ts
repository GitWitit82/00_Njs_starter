import { NextResponse } from "next/server"
import { z } from "zod"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth-utils"

const workflowSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
})

/**
 * GET /api/workflows/[workflowId]
 * Get a specific workflow
 */
export async function GET(
  req: Request,
  { params }: { params: { workflowId: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || !["ADMIN", "MANAGER"].includes(user.role)) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const workflow = await db.workflow.findUnique({
      where: {
        id: params.workflowId,
      },
      include: {
        phases: {
          orderBy: {
            order: "asc",
          },
          include: {
            tasks: true,
          },
        },
        _count: {
          select: {
            projects: true,
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
  { params }: { params: { workflowId: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const body = await req.json()
    const validatedFields = workflowSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", issues: validatedFields.error.issues },
        { status: 400 }
      )
    }

    const { name, description } = validatedFields.data

    const workflow = await db.workflow.update({
      where: {
        id: params.workflowId,
      },
      data: {
        name,
        description,
      },
    })

    return NextResponse.json(workflow)
  } catch (error) {
    if (error instanceof Error) {
      console.error("[WORKFLOW_PUT]", error.message)
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
  { params }: { params: { workflowId: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Check if workflow has any projects
    const workflow = await db.workflow.findUnique({
      where: {
        id: params.workflowId,
      },
      include: {
        _count: {
          select: {
            projects: true,
          },
        },
      },
    })

    if (!workflow) {
      return new NextResponse("Workflow not found", { status: 404 })
    }

    if (workflow._count.projects > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete workflow with existing projects. Please delete the projects first.",
        },
        { status: 400 }
      )
    }

    await db.workflow.delete({
      where: {
        id: params.workflowId,
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