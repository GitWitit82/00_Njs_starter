import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
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

export async function PATCH(
  request: Request,
  { params }: { params: { workflowId: string; phaseId: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await request.json()
    const remainingTasks = await prisma.workflowTask.findMany({
      where: {
        phaseId: params.phaseId,
        id: { not: params.taskId },
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
      where: { id: params.taskId },
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
    return new NextResponse("Internal error", { status: 500 })
  }
} 