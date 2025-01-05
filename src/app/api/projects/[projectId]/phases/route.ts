import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/lib/auth"

const phaseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  order: z.number().int().min(0),
})

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const phases = await db.projectPhase.findMany({
      where: { projectId: params.projectId },
      orderBy: { order: "asc" },
      include: {
        tasks: {
          orderBy: { order: "asc" },
          include: {
            department: true,
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(phases)
  } catch (error) {
    console.error("[PROJECT_PHASES_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const project = await db.project.findUnique({
      where: { id: params.projectId },
      select: { managerId: true },
    })

    if (!project) {
      return new NextResponse("Project not found", { status: 404 })
    }

    // Only allow manager or admin to create phases
    if (
      project.managerId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const json = await request.json()
    const body = phaseSchema.parse(json)

    // If order is provided, shift existing phases
    if (body.order !== undefined) {
      await db.projectPhase.updateMany({
        where: {
          projectId: params.projectId,
          order: {
            gte: body.order,
          },
        },
        data: {
          order: {
            increment: 1,
          },
        },
      })
    }

    const phase = await db.projectPhase.create({
      data: {
        name: body.name,
        description: body.description,
        order: body.order,
        projectId: params.projectId,
      },
      include: {
        tasks: {
          orderBy: { order: "asc" },
          include: {
            department: true,
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(phase)
  } catch (error) {
    console.error("[PROJECT_PHASES_POST]", error)
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: error.errors[0].message }), {
        status: 400,
      })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
} 