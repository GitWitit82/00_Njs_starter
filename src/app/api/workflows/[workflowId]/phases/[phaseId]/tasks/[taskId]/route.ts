import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { TaskStatus, Priority } from "@prisma/client"

interface TaskUpdateData {
  name?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  manHours?: number;
  order?: number;
  departmentId?: string;
  assignedToId?: string;
}

interface ReorderTask {
  id: string;
  order: number;
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const paths = request.url.split("/")
    const phaseId = paths[paths.indexOf("phases") + 1]
    const taskId = paths[paths.indexOf("tasks") + 1]

    const json = await request.json()
    const remainingTasks = await prisma.workflowTask.findMany({
      where: {
        phaseId: phaseId,
        id: { not: taskId },
      },
      orderBy: { order: "asc" },
    })

    // If order is provided, shift existing tasks
    if (json.order !== undefined) {
      await prisma.$transaction(
        remainingTasks.map((task: ReorderTask, index: number) =>
          prisma.workflowTask.update({
            where: { id: task.id },
            data: {
              order: index >= json.order ? index + 1 : index,
            },
          })
        )
      )
    }

    const task = await prisma.workflowTask.update({
      where: { id: taskId },
      data: json as TaskUpdateData,
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
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("[WORKFLOW_TASK_PATCH]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 