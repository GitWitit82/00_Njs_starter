/**
 * @file Phase API Route Handler
 * @description Handles API requests for workflow phases
 */

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

/**
 * GET handler for retrieving a specific phase with its tasks
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

    const phase = await prisma.phase.findUnique({
      where: {
        id: params.phaseId,
      },
      include: {
        workflow: true,
        tasks: {
          orderBy: {
            order: "asc",
          },
          include: {
            department: true,
          },
        },
      },
    })

    if (!phase) {
      return new NextResponse("Phase not found", { status: 404 })
    }

    if (phase.workflowId !== params.workflowId) {
      return new NextResponse("Phase does not belong to workflow", { status: 400 })
    }

    return NextResponse.json(phase)
  } catch (error) {
    console.error("[PHASE_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

/**
 * PATCH handler for updating a phase
 */
export async function PATCH(
  request: Request,
  { params }: { params: { workflowId: string; phaseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await request.json()

    const phase = await prisma.phase.update({
      where: {
        id: params.phaseId,
      },
      data: {
        name: json.name,
        description: json.description,
        order: json.order,
      },
    })

    return NextResponse.json(phase)
  } catch (error) {
    console.error("[PHASE_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

/**
 * DELETE handler for removing a phase
 */
export async function DELETE(
  request: Request,
  { params }: { params: { workflowId: string; phaseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await prisma.phase.delete({
      where: {
        id: params.phaseId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[PHASE_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 