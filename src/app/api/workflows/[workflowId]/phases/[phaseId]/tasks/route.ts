/**
 * @file Tasks API Route
 * @description Handles API requests for workflow phase tasks
 */

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { Priority } from "@prisma/client"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { WorkflowTaskCreatePayload, WorkflowTaskUpdatePayload } from "@/types/workflows"

/**
 * Schema for validating task requests
 */
const taskSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  priority: z.nativeEnum(Priority),
  manHours: z.number().min(0).optional(),
  order: z.number().int().min(0).optional(),
  departmentId: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
})

/**
 * GET /api/workflows/:workflowId/phases/:phaseId/tasks
 * Retrieves all tasks for a workflow phase
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extract IDs from URL
    const urlParts = request.url.split("/")
    const phaseId = urlParts[urlParts.indexOf("phases") + 1]

    const tasks = await prisma.workflowTask.findMany({
      where: {
        phaseId: phaseId,
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        dependencies: {
          include: {
            dependsOnTask: {
              include: {
                department: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        dependsOn: {
          include: {
            task: {
              include: {
                department: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("[GET] /api/workflows/[workflowId]/phases/[phaseId]/tasks error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * POST /api/workflows/:workflowId/phases/:phaseId/tasks
 * Creates a new task in a workflow phase
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extract IDs from URL
    const urlParts = request.url.split("/")
    const phaseId = urlParts[urlParts.indexOf("phases") + 1]

    const json = await request.json()
    const body = taskSchema.parse(json) as WorkflowTaskCreatePayload

    // Get the current highest order
    const highestOrder = await prisma.workflowTask.findFirst({
      where: { phaseId: phaseId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    // Create the task
    const task = await prisma.workflowTask.create({
      data: {
        name: body.name,
        description: body.description,
        priority: body.priority,
        manHours: body.manHours,
        order: body.order ?? (highestOrder?.order ?? -1) + 1,
        departmentId: body.departmentId,
        phase: {
          connect: { id: phaseId },
        },
      },
    })

    // If there are dependencies, create them
    if (body.dependencies?.length) {
      await prisma.workflowTaskDependency.createMany({
        data: body.dependencies.map((dependsOnId) => ({
          taskId: task.id,
          dependsOnId,
        })),
      })
    }

    // Fetch the complete task with relations
    const completeTask = await prisma.workflowTask.findUnique({
      where: { id: task.id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        dependencies: {
          include: {
            dependsOnTask: {
              include: {
                department: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        dependsOn: {
          include: {
            task: {
              include: {
                department: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    return NextResponse.json(completeTask)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 422 })
    }

    console.error("[POST] /api/workflows/[workflowId]/phases/[phaseId]/tasks error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * PATCH /api/workflows/:workflowId/phases/:phaseId/tasks/:taskId
 * Updates an existing task
 */
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extract IDs from URL
    const urlParts = request.url.split("/")
    const phaseId = urlParts[urlParts.indexOf("phases") + 1]
    const taskId = urlParts[urlParts.indexOf("tasks") + 1]

    const json = await request.json()
    const body = taskSchema.partial().parse(json) as WorkflowTaskUpdatePayload

    // Update task and dependencies in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the task
      const task = await tx.workflowTask.update({
        where: {
          id: taskId,
          phaseId: phaseId,
        },
        data: {
          name: body.name,
          description: body.description,
          priority: body.priority,
          manHours: body.manHours,
          order: body.order,
          departmentId: body.departmentId,
        },
      })

      // Update dependencies if provided
      if (body.dependencies) {
        // Remove existing dependencies
        await tx.workflowTaskDependency.deleteMany({
          where: { taskId: task.id },
        })

        // Create new dependencies
        if (body.dependencies.length > 0) {
          await tx.workflowTaskDependency.createMany({
            data: body.dependencies.map((dependsOnId) => ({
              taskId: task.id,
              dependsOnId,
            })),
          })
        }
      }

      // Return complete task with relations
      return tx.workflowTask.findUnique({
        where: { id: task.id },
        include: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          dependencies: {
            include: {
              dependsOnTask: {
                include: {
                  department: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
          dependsOn: {
            include: {
              task: {
                include: {
                  department: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      })
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 422 })
    }

    console.error("[PATCH] /api/workflows/[workflowId]/phases/[phaseId]/tasks/[taskId] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * DELETE /api/workflows/:workflowId/phases/:phaseId/tasks/:taskId
 * Deletes a task from a workflow phase
 */
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extract IDs from URL
    const urlParts = request.url.split("/")
    const phaseId = urlParts[urlParts.indexOf("phases") + 1]
    const taskId = urlParts[urlParts.indexOf("tasks") + 1]

    // Delete task and its dependencies in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete task dependencies
      await tx.workflowTaskDependency.deleteMany({
        where: {
          OR: [
            { taskId: taskId },
            { dependsOnId: taskId },
          ],
        },
      })

      // Delete the task
      await tx.workflowTask.delete({
        where: {
          id: taskId,
          phaseId: phaseId,
        },
      })
    })

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("[DELETE] /api/workflows/[workflowId]/phases/[phaseId]/tasks/[taskId] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 