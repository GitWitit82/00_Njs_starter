import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { RouteHandler } from "@/lib/auth-utils"
import { Role } from "@prisma/client"

type RouteParams = {
  workflowId: string
}

export const PUT = RouteHandler<RouteParams>(async (req, { params }) => {
  try {
    const { phases } = await req.json()
    
    // Update phase orders in a transaction
    await prisma.$transaction(
      phases.map((phase: { id: string; order: number }) =>
        prisma.phase.update({
          where: { 
            id: phase.id,
            workflowId: params.workflowId 
          },
          data: { order: phase.order }
        })
      )
    )

    return NextResponse.json({ message: "Phases reordered successfully" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}, Role.MANAGER) 