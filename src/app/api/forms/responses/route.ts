import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const formResponseSchema = z.object({
  templateId: z.string(),
  data: z.record(z.any()),
  status: z.enum(["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"]).default("DRAFT"),
  projectTaskId: z.string().optional(),
})

/**
 * GET /api/forms/responses
 * Retrieves form responses with optional filtering
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const templateId = searchParams.get("templateId")
  const projectTaskId = searchParams.get("projectTaskId")
  const status = searchParams.get("status")
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")

  const where = {
    ...(templateId && { templateId }),
    ...(projectTaskId && { projectTaskId }),
    ...(status && { status }),
  }

  const [responses, total] = await Promise.all([
    prisma.formResponse.findMany({
      where,
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
        projectTask: {
          select: {
            name: true,
            project: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.formResponse.count({ where }),
  ])

  return NextResponse.json({
    responses,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  })
}

/**
 * POST /api/forms/responses
 * Creates a new form response
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const json = await request.json()
    const body = formResponseSchema.parse(json)

    const response = await prisma.formResponse.create({
      data: {
        ...body,
        submittedById: session.user.id,
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