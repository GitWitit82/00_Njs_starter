import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

/**
 * Schema for updating a form response
 */
const updateResponseSchema = z.object({
  data: z.any().optional(),
  metadata: z.any().optional(),
  status: z.enum(["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"]).optional(),
  comments: z.string().optional(),
})

/**
 * GET /api/forms/instances/[id]/responses/[responseId]
 * Get a specific form response
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string; responseId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const response = await prisma.formResponse.findFirst({
      where: {
        id: params.responseId,
        instanceId: params.id,
      },
      include: {
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        history: {
          orderBy: {
            changedAt: "desc",
          },
          include: {
            changedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!response) {
      return new NextResponse("Response not found", { status: 404 })
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("[FORM_RESPONSE_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

/**
 * PATCH /api/forms/instances/[id]/responses/[responseId]
 * Update a form response
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string; responseId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = updateResponseSchema.parse(json)

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Update the response and create a history entry
    const response = await prisma.$transaction(async (tx) => {
      // Update the response
      const response = await tx.formResponse.update({
        where: {
          id: params.responseId,
        },
        data: {
          ...(body.data && { data: body.data }),
          ...(body.metadata && { metadata: body.metadata }),
          ...(body.status && { status: body.status }),
          ...(body.comments && { comments: body.comments }),
          ...(body.status === "SUBMITTED" && {
            submittedAt: new Date(),
            submittedById: user.id,
          }),
          ...(["APPROVED", "REJECTED"].includes(body.status || "") && {
            reviewedAt: new Date(),
            reviewedById: user.id,
          }),
        },
      })

      // Create history entry
      await tx.formResponseHistory.create({
        data: {
          responseId: response.id,
          data: response.data,
          metadata: response.metadata,
          status: response.status,
          changedById: user.id,
          changeType: body.status ? body.status : "UPDATED",
          comments: body.comments,
        },
      })

      return response
    })

    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }

    console.error("[FORM_RESPONSE_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

/**
 * DELETE /api/forms/instances/[id]/responses/[responseId]
 * Delete a form response (only if in DRAFT status)
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string; responseId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const response = await prisma.formResponse.findFirst({
      where: {
        id: params.responseId,
        instanceId: params.id,
      },
    })

    if (!response) {
      return new NextResponse("Response not found", { status: 404 })
    }

    if (response.status !== "DRAFT") {
      return new NextResponse(
        "Only draft responses can be deleted",
        { status: 400 }
      )
    }

    await prisma.formResponse.delete({
      where: {
        id: params.responseId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[FORM_RESPONSE_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 