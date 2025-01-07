import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

/**
 * Schema for creating a form response
 */
const createResponseSchema = z.object({
  data: z.any(),
  metadata: z.any().optional(),
  version: z.number(),
})

/**
 * GET /api/forms/instances/[id]/responses
 * Get responses for a form instance
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const responses = await prisma.formResponse.findMany({
      where: {
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
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(responses)
  } catch (error) {
    console.error("[FORM_RESPONSES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

/**
 * POST /api/forms/instances/[id]/responses
 * Create a new form response
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = createResponseSchema.parse(json)

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Create the response and its initial history entry
    const response = await prisma.$transaction(async (tx) => {
      // Create the response
      const response = await tx.formResponse.create({
        data: {
          instanceId: params.id,
          data: body.data,
          metadata: body.metadata,
          version: body.version,
        },
      })

      // Create the initial history entry
      await tx.formResponseHistory.create({
        data: {
          responseId: response.id,
          data: body.data,
          metadata: body.metadata,
          status: "DRAFT",
          changedById: user.id,
          changeType: "CREATED",
        },
      })

      return response
    })

    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }

    console.error("[FORM_RESPONSE_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 