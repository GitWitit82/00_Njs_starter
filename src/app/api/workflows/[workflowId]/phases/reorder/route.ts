import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"

/**
 * PUT /api/workflows/:workflowId/phases/reorder
 * Reorders phases in a workflow
 */
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has manager role
    if (!session.user.role || session.user.role !== Role.MANAGER) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Extract workflowId from URL
    const urlParts = request.url.split("/")
    const workflowId = urlParts[urlParts.indexOf("workflows") + 1]

    const { phases } = await request.json()
    
    // Update phase orders in a transaction
    await prisma.$transaction(
      phases.map((phase: { id: string; order: number }) =>
        prisma.phase.update({
          where: { 
            id: phase.id,
            workflowId: workflowId 
          },
          data: { order: phase.order }
        })
      )
    )

    return NextResponse.json({ message: "Phases reordered successfully" })
  } catch (error) {
    console.error("[PUT] /api/workflows/[workflowId]/phases/reorder error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 