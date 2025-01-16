import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { TaskSchedulingService } from "@/lib/services/task-scheduling.service"
import { authOptions } from "@/lib/auth"

// Schema for schedule update request
const scheduleUpdateSchema = z.object({
  scheduledStart: z.string().transform(str => new Date(str)),
  actualStart: z.string().optional().transform(str => str ? new Date(str) : undefined),
  actualEnd: z.string().optional().transform(str => str ? new Date(str) : undefined),
})

export async function PATCH(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await request.json()
    const body = scheduleUpdateSchema.parse(json)

    // Schedule the task
    const updatedTask = await TaskSchedulingService.scheduleTask(
      params.taskId,
      body.scheduledStart
    )

    // If actual dates are provided, update them
    if (body.actualStart || body.actualEnd) {
      await TaskSchedulingService.updateActualDates(params.taskId, {
        actualStart: body.actualStart,
        actualEnd: body.actualEnd
      })
    }

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("[TASK_SCHEDULE_UPDATE]", error)
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const task = await prisma.projectTask.findUnique({
      where: { id: params.taskId },
      select: {
        scheduledStart: true,
        scheduledEnd: true,
        actualStart: true,
        actualEnd: true,
        manHours: true,
        project: {
          select: {
            startDate: true,
            endDate: true
          }
        }
      }
    })

    if (!task) {
      return new NextResponse("Task not found", { status: 404 })
    }

    const efficiency = TaskSchedulingService.calculateEfficiency(task)

    return NextResponse.json({
      ...task,
      efficiency
    })
  } catch (error) {
    console.error("[TASK_SCHEDULE_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 