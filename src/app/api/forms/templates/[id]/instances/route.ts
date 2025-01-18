import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const querySchema = z.object({
  status: z.string().optional(),
  offset: z.coerce.number().default(0),
  limit: z.coerce.number().default(10)
})

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const paths = request.url.split("/")
    const id = paths[paths.indexOf("templates") + 1]
    const { searchParams } = new URL(request.url)
    const validatedQuery = querySchema.parse(Object.fromEntries(searchParams))

    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      )
    }

    const template = await prisma.formTemplate.findUnique({
      where: { id },
      select: { 
        id: true,
        name: true,
        description: true,
        versions: {
          where: {
            isCurrent: true
          },
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!template) {
      return NextResponse.json(
        { error: "Form template not found" },
        { status: 404 }
      )
    }

    const where = {
      templateId: id,
      ...(validatedQuery.status && { status: validatedQuery.status })
    }

    const [instances, count] = await Promise.all([
      prisma.formInstance.findMany({
        where,
        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          version: {
            select: {
              id: true,
              name: true
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
        },
        skip: validatedQuery.offset,
        take: validatedQuery.limit
      }),
      prisma.formInstance.count({ where })
    ])

    return NextResponse.json({ 
      template,
      instances,
      count,
      pagination: {
        limit: validatedQuery.limit,
        offset: validatedQuery.offset,
        total: count
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.errors },
        { status: 400 }
      )
    }
    console.error("[TEMPLATE_INSTANCES]", error)
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
    const paths = request.url.split("/")
    const id = paths[paths.indexOf("templates") + 1]
    const { projectId, taskId, phaseId } = await request.json()

    const template = await prisma.formTemplate.findUnique({
      where: { id },
      include: {
        versions: {
          where: {
            isCurrent: true
          }
        }
      }
    })

    if (!template) {
      return NextResponse.json(
        { error: "Form template not found" },
        { status: 404 }
      )
    }

    if (!template.versions.length) {
      return NextResponse.json(
        { error: "Template has no current version" },
        { status: 400 }
      )
    }

    const instance = await prisma.formInstance.create({
      data: {
        templateId: id,
        versionId: template.versions[0].id,
        projectId,
        taskId,
        phaseId
      },
      include: {
        template: true,
        version: true,
        project: true,
        task: true,
        phase: true
      }
    })

    return NextResponse.json(instance)
  } catch (error) {
    console.error("[TEMPLATE_INSTANCES_POST]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 