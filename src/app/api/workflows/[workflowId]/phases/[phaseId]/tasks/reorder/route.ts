import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

interface TaskOrder {
  id: string;
  order: number;
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const paths = request.url.split("/")
    const phaseId = paths[paths.indexOf("phases") + 1]
    const { tasks } = await request.json()
    
    // Update task orders in a transaction
    await prisma.$transaction(
      tasks.map((task: TaskOrder) =>
        prisma.task.update({
          where: { 
            id: task.id,
            phaseId: phaseId 
          },
          data: { order: task.order }
        })
      )
    )

    return NextResponse.json({ message: "Tasks reordered successfully" })
  } catch (error) {
    console.error("[TASKS_REORDER]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 