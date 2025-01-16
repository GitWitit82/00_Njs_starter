/**
 * @file Tasks API Route
 * @description Handles API requests for workflow phase tasks
 */

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

const taskSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  manHours: z.number().min(0.5),
  order: z.number().int().min(0),
  departmentId: z.string().optional(),
  formTemplateId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  dependencies: z.array(z.string()).optional(), // Array of task IDs this task depends on
})

/**
 * GET /api/workflows/:workflowId/phases/:phaseId/tasks
 * Retrieves all tasks for a workflow phase
 */
export async function GET(
  req: Request,
  { params }: { params: { workflowId: string; phaseId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tasks = await prisma.workflowTask.findMany({
      where: {
        phaseId: params.phaseId,
      },
      include: {
        department: true,
        dependencies: {
          include: {
            dependsOnTask: true,
          },
        },
        formTemplate: true,
      },
      orderBy: {
        order: 'asc',
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/workflows/:workflowId/phases/:phaseId/tasks
 * Creates a new task in a workflow phase
 */
export async function POST(
  req: Request,
  { params }: { params: { workflowId: string; phaseId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await req.json()
    const body = taskSchema.parse(json)

    // Get the current highest order
    const highestOrder = await prisma.workflowTask.findFirst({
      where: { phaseId: params.phaseId },
      orderBy: { order: 'desc' },
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
        formTemplateId: body.formTemplateId,
        metadata: body.metadata,
        phase: {
          connect: { id: params.phaseId },
        },
      },
    })

    // If there are dependencies, create them
    if (body.dependencies?.length) {
      await prisma.workflowTaskDependency.createMany({
        data: body.dependencies.map((dependsOnId) => ({
          taskId: task.id,
          dependsOnId,
          type: 'FINISH_TO_START',
        })),
      })
    }

    // Fetch the complete task with relations
    const completeTask = await prisma.workflowTask.findUnique({
      where: { id: task.id },
      include: {
        department: true,
        dependencies: {
          include: {
            dependsOnTask: true,
          },
        },
        formTemplate: true,
      },
    })

    return NextResponse.json(completeTask)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/workflows/:workflowId/phases/:phaseId/tasks/:taskId
 * Updates an existing task
 */
export async function PUT(
  req: Request,
  { params }: { params: { workflowId: string; phaseId: string; taskId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await req.json()
    const body = taskSchema.parse(json)

    // Update task and dependencies in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the task
      const task = await tx.workflowTask.update({
        where: {
          id: params.taskId,
          phaseId: params.phaseId,
        },
        data: {
          name: body.name,
          description: body.description,
          priority: body.priority,
          manHours: body.manHours,
          order: body.order,
          departmentId: body.departmentId,
          formTemplateId: body.formTemplateId,
          metadata: body.metadata,
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
              type: 'FINISH_TO_START',
            })),
          })
        }
      }

      // Return complete task with relations
      return tx.workflowTask.findUnique({
        where: { id: task.id },
        include: {
          department: true,
          dependencies: {
            include: {
              dependsOnTask: true,
            },
          },
          formTemplate: true,
        },
      })
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/workflows/:workflowId/phases/:phaseId/tasks/:taskId
 * Deletes a task and reorders remaining tasks
 */
export async function DELETE(
  req: Request,
  { params }: { params: { workflowId: string; phaseId: string; taskId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Handle deletion and reordering in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get the task to be deleted
      const task = await tx.workflowTask.findUnique({
        where: { id: params.taskId },
        select: { order: true },
      })

      if (!task) {
        throw new Error('Task not found')
      }

      // Delete the task
      await tx.workflowTask.delete({
        where: { id: params.taskId },
      })

      // Reorder remaining tasks
      await tx.workflowTask.updateMany({
        where: {
          phaseId: params.phaseId,
          order: {
            gt: task.order,
          },
        },
        data: {
          order: {
            decrement: 1,
          },
        },
      })

      // Return updated task list
      return tx.workflowTask.findMany({
        where: { phaseId: params.phaseId },
        orderBy: { order: 'asc' },
        include: {
          department: true,
          dependencies: {
            include: {
              dependsOnTask: true,
            },
          },
          formTemplate: true,
        },
      })
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
} 