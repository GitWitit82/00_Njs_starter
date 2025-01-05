import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/lib/auth"

const projectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  workflowId: z.string(),
  managerId: z.string(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const projects = await db.project.findMany({
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        phases: {
          include: {
            tasks: true,
          },
        },
      },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error("[PROJECTS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const json = await request.json()
    const body = projectSchema.parse(json)

    // Check if workflow exists
    const workflow = await db.workflow.findUnique({
      where: { id: body.workflowId },
      include: {
        phases: {
          include: {
            tasks: true,
          },
        },
      },
    })

    if (!workflow) {
      return new NextResponse("Workflow not found", { status: 404 })
    }

    // Create project with phases and tasks from workflow
    const project = await db.project.create({
      data: {
        name: body.name,
        description: body.description,
        workflowId: body.workflowId,
        managerId: body.managerId,
        startDate: new Date(),
        phases: {
          create: workflow.phases.map((phase) => ({
            name: phase.name,
            description: phase.description,
            order: phase.order,
            phaseId: phase.id,
            tasks: {
              create: phase.tasks.map((task) => ({
                name: task.name,
                description: task.description,
                priority: task.priority,
                manHours: task.manHours,
                order: task.order,
                departmentId: task.departmentId,
                workflowTaskId: task.id,
              })),
            },
          })),
        },
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        phases: {
          include: {
            tasks: true,
          },
        },
      },
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error("[PROJECTS_POST]", error)
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: error.errors[0].message }), {
        status: 400,
      })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
} 