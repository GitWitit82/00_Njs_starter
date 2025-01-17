import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { RouteHandler } from "@/lib/auth-utils"
import { Role } from "@prisma/client"

type RouteParams = {
  workflowId: string
  phaseId: string
}

export const PUT = RouteHandler<RouteParams>(async (req, { params }) => {
  try {
    const { tasks } = await req.json()
    
    // Update task orders in a transaction
    await prisma.$transaction(
      tasks.map((task: { id: string; order: number }) =>
        prisma.task.update({
          where: { 
            id: task.id,
            phaseId: params.phaseId 
          },
          data: { order: task.order }
        })
      )
    )

    return NextResponse.json({ message: "Tasks reordered successfully" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}, Role.MANAGER) 