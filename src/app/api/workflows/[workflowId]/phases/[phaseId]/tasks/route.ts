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
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  manHours: z.number().min(0.25, "Minimum 0.25 hours").max(100, "Maximum 100 hours"),
  departmentId: z.string().optional(),
})

/**
 * POST handler for creating a new task
 */
export async function POST(
  request: Request,
  { params }: { params: { workflowId: string; phaseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get the last task's order for this phase
    const lastTask = await prisma.workflowTask.findFirst({
      where: { phaseId: params.phaseId },
      orderBy: { order: "desc" },
    })

    const nextOrder = (lastTask?.order ?? -1) + 1

    // Validate request body
    const json = await request.json()
    const validatedData = taskSchema.parse(json)

    // Create the task
    const task = await prisma.workflowTask.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        priority: validatedData.priority,
        manHours: validatedData.manHours,
        order: nextOrder,
        phaseId: params.phaseId,
        departmentId: validatedData.departmentId,
      },
      include: {
        department: true,
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 })
    }
    console.error("[TASK_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

/**
 * GET handler for retrieving tasks
 */
export async function GET(
  request: Request,
  { params }: { params: { workflowId: string; phaseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const tasks = await prisma.workflowTask.findMany({
      where: {
        phaseId: params.phaseId,
      },
      orderBy: {
        order: "asc",
      },
      include: {
        department: true,
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("[TASKS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 