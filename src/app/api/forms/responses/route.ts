import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { FormStatus, Prisma } from "@prisma/client"
import { z } from "zod"

const createResponseSchema = z.object({
  instanceId: z.string(),
  templateId: z.string(),
  data: z.record(z.any()),
  status: z.nativeEnum(FormStatus),
  taskId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

const querySchema = z.object({
  status: z.nativeEnum(FormStatus).optional(),
  taskId: z.string().optional(),
  templateId: z.string().optional(),
  instanceId: z.string().optional(),
})

/**
 * GET /api/forms/responses
 * Retrieves form responses with optional filtering
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const { searchParams } = new URL(request.url)
    const queryResult = querySchema.safeParse({
      status: searchParams.get("status"),
      taskId: searchParams.get("taskId"),
      templateId: searchParams.get("templateId"),
      instanceId: searchParams.get("instanceId"),
    })

    if (!queryResult.success) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid query parameters", details: queryResult.error.errors }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const where: Prisma.FormResponseWhereInput = {}

    // Only add defined parameters to where clause
    Object.entries(queryResult.data).forEach(([key, value]) => {
      if (value !== undefined) {
        where[key as keyof Prisma.FormResponseWhereInput] = value
      }
    })

    const [responses, total] = await prisma.$transaction([
      prisma.formResponse.findMany({
        where,
        include: {
          instance: true,
          template: {
            select: {
              name: true,
              type: true,
              priority: true,
              department: true,
            },
          },
          task: {
            include: {
              department: true,
            },
          },
          submittedBy: {
            select: {
              id: true,
              name: true,
            },
          },
          reviewedBy: {
            select: {
              id: true,
              name: true,
            },
          },
          history: {
            orderBy: {
              createdAt: "desc",
            },
            include: {
              changedBy: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          statusHistory: {
            orderBy: {
              createdAt: "desc",
            },
            include: {
              changedBy: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.formResponse.count({ where })
    ])

    return NextResponse.json({
      data: responses,
      total,
    })
  } catch (error) {
    console.error("[FORM_RESPONSES_GET]", error)
    return new NextResponse(
      JSON.stringify({ error: "Internal Error" }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

/**
 * POST /api/forms/responses
 * Creates a new form response
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await request.json()
    const body = createResponseSchema.parse(json)

    // Verify that the instance exists
    const instance = await prisma.formInstance.findUnique({
      where: { id: body.instanceId },
      include: {
        template: true,
      },
    })

    if (!instance) {
      return new NextResponse(
        JSON.stringify({ error: "Form instance not found" }),
        { status: 404 }
      )
    }

    // Create the response
    const response = await prisma.formResponse.create({
      data: {
        instanceId: body.instanceId,
        templateId: body.templateId,
        data: body.data,
        status: body.status,
        taskId: body.taskId,
        metadata: body.metadata,
        submittedById: session.user.id,
      },
      include: {
        instance: true,
        template: {
          select: {
            name: true,
            type: true,
            priority: true,
            department: true,
          },
        },
        task: {
          include: {
            department: true,
          },
        },
        submittedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid request data", details: error.errors }),
        { 
          status: 422,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    console.error("[FORM_RESPONSES_POST]", error)
    return new NextResponse(
      JSON.stringify({ error: "Internal Error" }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
} 