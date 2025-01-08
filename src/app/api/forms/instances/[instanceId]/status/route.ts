import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { 
  updateFormStatus, 
  isValidStatusTransition,
  checkFormCompletion 
} from "@/lib/utils/form-status"

const statusUpdateSchema = z.object({
  status: z.enum([
    "ACTIVE",
    "IN_PROGRESS",
    "PENDING_REVIEW",
    "COMPLETED",
    "ARCHIVED",
    "ON_HOLD"
  ]),
  comments: z.string().optional(),
  metadata: z.record(z.any()).optional()
})

/**
 * PATCH /api/forms/instances/[instanceId]/status
 * Updates the status of a form instance
 */
export async function PATCH(
  req: Request,
  { params }: { params: { instanceId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const instanceId = params.instanceId
    const json = await req.json()
    const body = statusUpdateSchema.parse(json)

    // Get current instance
    const instance = await prisma.formInstance.findUnique({
      where: { id: instanceId }
    })

    if (!instance) {
      return new NextResponse("Form instance not found", { status: 404 })
    }

    // Validate status transition
    if (!isValidStatusTransition(instance.status, body.status)) {
      return new NextResponse(
        `Invalid status transition from ${instance.status} to ${body.status}`,
        { status: 400 }
      )
    }

    // If transitioning to COMPLETED, check dependencies
    if (body.status === "COMPLETED") {
      const completionCheck = await checkFormCompletion(instanceId)
      if (!completionCheck.isComplete) {
        return new NextResponse(
          "Cannot complete form: dependencies not satisfied",
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        )
      }
    }

    // Update status
    await updateFormStatus(instanceId, session.user.id, {
      status: body.status,
      comments: body.comments,
      metadata: {
        ...body.metadata,
        updatedAt: new Date().toISOString(),
        updatedBy: session.user.id
      }
    })

    return new NextResponse("Status updated successfully")
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }

    console.error("[FORM_STATUS_UPDATE]", error)
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Error",
      { status: 500 }
    )
  }
}

/**
 * GET /api/forms/instances/[instanceId]/status
 * Gets the status history of a form instance
 */
export async function GET(
  req: Request,
  { params }: { params: { instanceId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const instanceId = params.instanceId

    const history = await prisma.formStatusHistory.findMany({
      where: { instanceId },
      include: {
        changedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        changedAt: "desc"
      }
    })

    return NextResponse.json(history)
  } catch (error) {
    console.error("[FORM_STATUS_HISTORY]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 