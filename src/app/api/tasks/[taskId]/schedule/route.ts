import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const paths = request.url.split("/")
    const taskId = paths[paths.indexOf("tasks") + 1]

    const task = await prisma.projectTask.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        name: true,
        scheduledStart: true,
        scheduledEnd: true,
        actualStart: true,
        actualEnd: true,
        status: true
      }
    })

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("[TASK_SCHEDULE_GET]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const paths = request.url.split("/")
    const taskId = paths[paths.indexOf("tasks") + 1]
    const { scheduledStart, scheduledEnd, actualStart, actualEnd } = await request.json()

    const task = await prisma.projectTask.findUnique({
      where: { id: taskId }
    })

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      )
    }

    const updatedTask = await prisma.projectTask.update({
      where: { id: taskId },
      data: {
        scheduledStart: scheduledStart ? new Date(scheduledStart) : null,
        scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : null,
        actualStart: actualStart ? new Date(actualStart) : null,
        actualEnd: actualEnd ? new Date(actualEnd) : null
      },
      select: {
        id: true,
        name: true,
        scheduledStart: true,
        scheduledEnd: true,
        actualStart: true,
        actualEnd: true,
        status: true
      }
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("[TASK_SCHEDULE_PATCH]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 