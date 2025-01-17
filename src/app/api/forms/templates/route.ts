import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { Prisma, FormInstanceStatus } from "@prisma/client"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"

const createTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  phaseId: z.string().optional(),
  metadata: z.record(z.unknown()).optional().default({}),
  version: z.object({
    name: z.string().min(1, "Version name is required"),
    description: z.string().optional(),
    schema: z.record(z.unknown()).default({}),
    layout: z.record(z.unknown()).default({}),
    style: z.record(z.unknown()).default({}),
    defaultValues: z.record(z.unknown()).default({}),
    metadata: z.record(z.unknown()).optional().default({})
  })
})

const querySchema = z.object({
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  phaseId: z.string().optional(),
  status: z.nativeEnum(FormInstanceStatus).optional()
})

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const validatedQuery = querySchema.parse(Object.fromEntries(searchParams))

    const where: Prisma.FormTemplateWhereInput = {}
    for (const [key, value] of Object.entries(validatedQuery)) {
      if (value) {
        where[key as keyof Prisma.FormTemplateWhereInput] = value
      }
    }

    const [templates, count] = await Promise.all([
      prisma.formTemplate.findMany({
        where,
        include: {
          versions: {
            where: {
              isCurrent: true
            }
          },
          completionRequirements: {
            include: {
              dependsOn: true
            }
          },
          project: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          task: {
            select: {
              id: true,
              name: true,
              status: true
            }
          },
          phase: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }),
      prisma.formTemplate.count({ where })
    ])

    return NextResponse.json({ templates, count })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.errors },
        { status: 400 }
      )
    }
    console.error("[FORM_TEMPLATES_GET]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const validatedBody = createTemplateSchema.parse(await request.json())

    const template = await prisma.formTemplate.create({
      data: {
        name: validatedBody.name,
        description: validatedBody.description,
        projectId: validatedBody.projectId,
        taskId: validatedBody.taskId,
        phaseId: validatedBody.phaseId,
        metadata: validatedBody.metadata as Prisma.JsonObject,
        versions: {
          create: {
            name: validatedBody.version.name,
            description: validatedBody.version.description,
            schema: validatedBody.version.schema as Prisma.JsonObject,
            layout: validatedBody.version.layout as Prisma.JsonObject,
            style: validatedBody.version.style as Prisma.JsonObject,
            defaultValues: validatedBody.version.defaultValues as Prisma.JsonObject,
            metadata: validatedBody.version.metadata as Prisma.JsonObject,
            isCurrent: true
          }
        }
      },
      include: {
        versions: {
          where: {
            isCurrent: true
          }
        },
        completionRequirements: {
          include: {
            dependsOn: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        task: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        phase: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 422 }
      )
    }
    console.error("[FORM_TEMPLATE_POST]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 