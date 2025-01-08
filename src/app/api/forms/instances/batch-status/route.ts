import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { 
  updateFormStatus, 
  isValidStatusTransition,
  checkFormCompletion 
} from "@/lib/utils/form-status"

const batchStatusUpdateSchema = z.object({
  formIds: z.array(z.string()),
  status: z.enum([
    "ACTIVE",
    "IN_PROGRESS",
    "PENDING_REVIEW",
    "COMPLETED",
    "ARCHIVED",
    "ON_HOLD"
  ]),
  comment: z.string().optional(),
  metadata: z.record(z.any()).optional()
})

/**
 * PATCH /api/forms/instances/batch-status
 * Updates the status of multiple form instances
 */
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = batchStatusUpdateSchema.parse(json)

    // Get all instances
    const instances = await prisma.formInstance.findMany({
      where: {
        id: {
          in: body.formIds
        }
      }
    })

    // Validate all status transitions
    const invalidTransitions = instances.filter(
      instance => !isValidStatusTransition(instance.status, body.status)
    )

    if (invalidTransitions.length > 0) {
      return new NextResponse(
        JSON.stringify({
          error: "Invalid status transitions",
          details: invalidTransitions.map(instance => ({
            id: instance.id,
            currentStatus: instance.status,
            targetStatus: body.status
          }))
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // If transitioning to COMPLETED, check dependencies for all forms
    if (body.status === "COMPLETED") {
      const completionChecks = await Promise.all(
        instances.map(instance => checkFormCompletion(instance.id))
      )

      const incompleteForms = completionChecks
        .map((check, index) => ({ check, instance: instances[index] }))
        .filter(({ check }) => !check.isComplete)

      if (incompleteForms.length > 0) {
        return new NextResponse(
          JSON.stringify({
            error: "Dependencies not satisfied",
            details: incompleteForms.map(({ instance }) => ({
              id: instance.id,
              message: "Dependencies not satisfied"
            }))
          }),
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
      }
    }

    // Update all instances in a transaction
    const updates = await prisma.$transaction(
      instances.map(instance =>
        updateFormStatus(instance.id, session.user.id, {
          status: body.status,
          comments: body.comment,
          metadata: {
            ...body.metadata,
            updatedAt: new Date().toISOString(),
            updatedBy: session.user.id,
            batchUpdate: true
          }
        })
      )
    )

    return NextResponse.json({
      message: "Status updated successfully",
      updatedForms: updates.length
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid request data", details: error.errors }),
        { 
          status: 422,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    console.error("[BATCH_STATUS_UPDATE]", error)
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Internal Error" 
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
} 