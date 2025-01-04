import { NextResponse } from "next/server"
import { z } from "zod"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth-utils"

const phaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
})

/**
 * GET /api/workflows/[workflowId]/phases
 * Get all phases for a workflow
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

    const phases = await db.phase.findMany({
      where: {
        workflowId,
      },
      orderBy: {
        order: "asc",
      },
      include: {
        tasks: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    })

    return NextResponse.json(phases)
  } catch (error) {
    if (error instanceof Error) {
      console.error("[PHASES_GET]", error.message)
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

/**
 * POST /api/workflows/[workflowId]/phases
 * Create a new phase
 */
export async function POST(
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

    const json = await req.json()
    const body = phaseSchema.parse(json)

    // Get the highest order value
    const lastPhase = await db.phase.findFirst({
      where: {
        workflowId,
      },
      orderBy: {
        order: "desc",
      },
    })

    const nextOrder = lastPhase ? lastPhase.order + 1 : 0

    const phase = await db.phase.create({
      data: {
        ...body,
        workflowId,
        order: nextOrder,
      },
    })

    return NextResponse.json(phase)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 })
    }

    if (error instanceof Error) {
      console.error("[PHASES_POST]", error.message)
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

/**
 * PUT /api/workflows/[workflowId]/phases
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

    const params = await context.params
    const { workflowId } = params

    if (!workflowId) {
      return new NextResponse("Missing required parameters", { status: 400 })
    }

    const json = await req.json()
    const { items } = json

    const transaction = items.map((phase: { id: string; order: number }) =>
      db.phase.update({
        where: {
          id: phase.id,
        },
        data: {
          order: phase.order,
        },
      })
    )

    const phases = await db.$transaction(transaction)

    return NextResponse.json(phases)
  } catch (error) {
    if (error instanceof Error) {
      console.error("[PHASES_REORDER]", error.message)
    }
    return new NextResponse("Internal error", { status: 500 })
  }
} 