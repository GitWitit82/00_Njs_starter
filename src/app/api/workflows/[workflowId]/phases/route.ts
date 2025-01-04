import { NextResponse } from "next/server"
import { z } from "zod"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth-utils"

const phaseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  order: z.number().int().min(0),
})

/**
 * POST /api/workflows/[workflowId]/phases
 * Create a new phase
 */
export async function POST(
  req: Request,
  { params }: { params: { workflowId: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const body = await req.json()
    const validatedFields = phaseSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", issues: validatedFields.error.issues },
        { status: 400 }
      )
    }

    const { name, order } = validatedFields.data

    // Check if workflow exists
    const workflow = await db.workflow.findUnique({
      where: {
        id: params.workflowId,
      },
    })

    if (!workflow) {
      return new NextResponse("Workflow not found", { status: 404 })
    }

    const phase = await db.phase.create({
      data: {
        name,
        order,
        workflowId: params.workflowId,
      },
    })

    return NextResponse.json(phase)
  } catch (error) {
    if (error instanceof Error) {
      console.error("[PHASES_POST]", error.message)
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

/**
 * PUT /api/workflows/[workflowId]/phases/reorder
 * Reorder phases
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
    const { phases } = body

    if (!Array.isArray(phases)) {
      return NextResponse.json(
        { error: "Invalid phases array" },
        { status: 400 }
      )
    }

    // Update all phases in a transaction
    await db.$transaction(
      phases.map((phase) =>
        db.phase.update({
          where: {
            id: phase.id,
            workflowId: params.workflowId,
          },
          data: {
            order: phase.order,
          },
        })
      )
    )

    // Fetch updated workflow with phases
    const workflow = await db.workflow.findUnique({
      where: {
        id: params.workflowId,
      },
      include: {
        phases: {
          orderBy: {
            order: "asc",
          },
        },
      },
    })

    return NextResponse.json(workflow)
  } catch (error) {
    if (error instanceof Error) {
      console.error("[PHASES_REORDER]", error.message)
    }
    return new NextResponse("Internal error", { status: 500 })
  }
} 