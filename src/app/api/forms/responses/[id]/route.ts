import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateFormResponseSchema = z.object({
  data: z.record(z.any()).optional(),
  status: z.enum(["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"]).optional(),
})

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/forms/responses/[id]
 * Retrieves a specific form response
 */
export async function GET(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const response = await prisma.formResponse.findUnique({
    where: { id: params.id },
    include: {
      template: {
        select: {
          name: true,
          type: true,
          schema: true,
          department: true,
          phase: {
            include: {
              workflow: true,
            },
          },
        },
      },
      submittedBy: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
      projectTask: {
        select: {
          name: true,
          project: {
            select: {
              name: true,
              status: true,
            },
          },
        },
      },
    },
  })

  if (!response) {
    return new NextResponse("Not Found", { status: 404 })
  }

  return NextResponse.json(response)
}

/**
 * PUT /api/forms/responses/[id]
 * Updates a form response
 */
export async function PUT(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const json = await request.json()
    const body = updateFormResponseSchema.parse(json)

    const response = await prisma.formResponse.update({
      where: { id: params.id },
      data: {
        ...body,
        updatedById: session.user.id,
      },
      include: {
        template: {
          select: {
            name: true,
            type: true,
          },
        },
        submittedBy: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 })
    }

    return new NextResponse(null, { status: 500 })
  }
}

/**
 * DELETE /api/forms/responses/[id]
 * Deletes a form response
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    await prisma.formResponse.delete({
      where: { id: params.id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return new NextResponse(null, { status: 500 })
  }
} 