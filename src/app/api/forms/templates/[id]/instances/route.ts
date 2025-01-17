import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { FormInstanceStatus } from "@prisma/client"

const querySchema = z.object({
  status: z.nativeEnum(FormInstanceStatus).optional(),
  limit: z.coerce.number().min(1).max(50).optional().default(5),
  offset: z.coerce.number().min(0).optional().default(0)
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = params
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

    // Count instances of this template
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