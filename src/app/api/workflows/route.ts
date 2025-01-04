import { NextResponse } from "next/server"
import { z } from "zod"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth-utils"

const workflowSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
})

/**
 * GET /api/workflows
 * Get all workflows
 */
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user || !["ADMIN", "MANAGER"].includes(user.role)) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const workflows = await db.workflow.findMany({
      include: {
        phases: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(workflows)
  } catch (error) {
    if (error instanceof Error) {
      console.error("[WORKFLOWS_GET]", error.message)
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

/**
 * POST /api/workflows
 * Create a new workflow
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || !["ADMIN", "MANAGER"].includes(user.role)) {
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

    const workflow = await db.workflow.create({
      data: {
        name,
        description,
      },
    })

    return NextResponse.json(workflow)
  } catch (error) {
    if (error instanceof Error) {
      console.error("[WORKFLOWS_POST]", error.message)
    }
    return new NextResponse("Internal error", { status: 500 })
  }
} 