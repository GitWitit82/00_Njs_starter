import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

// Schema for project creation/update
const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  workflowId: z.string().min(1, "Workflow is required"),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().optional().transform((str) => (str ? new Date(str) : undefined)),
})

/**
 * GET /api/projects
 * Get all projects with optional filtering and pagination
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const where = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          workflow: true,
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
              tasks: {
                select: {
                  id: true,
                  status: true,
                },
              },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.count({ where }),
    ])

    // Calculate progress for each project
    const projectsWithProgress = projects.map((project) => {
      const totalTasks = project.phases.reduce(
        (acc, phase) => acc + phase.tasks.length,
        0
      )
      const completedTasks = project.phases.reduce(
        (acc, phase) =>
          acc +
          phase.tasks.filter((task) => task.status === "COMPLETED").length,
        0
      )
      const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

      return {
        ...project,
        progress: Math.round(progress),
        _count: {
          tasks: totalTasks,
          completedTasks,
        },
      }
    })

    return NextResponse.json({
      projects: projectsWithProgress,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[PROJECTS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await request.json()
    const body = projectSchema.parse(json)

    // Get the workflow to copy its structure
    const workflow = await prisma.workflow.findUnique({
      where: { id: body.workflowId },
      include: {
        phases: {
          include: {
            tasks: true,
            formTemplates: true,
          },
        },
      },
    })

    if (!workflow) {
      return new NextResponse("Workflow not found", { status: 404 })
    }

    // Create project with its phases and tasks
    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description,
        startDate: body.startDate,
        endDate: body.endDate,
        workflowId: workflow.id,
        managerId: session.user.id,
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
        workflow: true,
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
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 422 })
    }

    console.error("[PROJECTS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 