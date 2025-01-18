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
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const paths = request.url.split("/")
    const workflowId = paths[paths.indexOf("workflows") + 1]
    const phaseId = paths[paths.indexOf("phases") + 1]

    const phase = await prisma.phase.findUnique({
      where: {
        id: phaseId,
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
      return NextResponse.json(
        { error: "Phase not found" },
        { status: 404 }
      )
    }

    if (phase.workflowId !== workflowId) {
      return NextResponse.json(
        { error: "Phase does not belong to workflow" },
        { status: 400 }
      )
    }

    return NextResponse.json(phase)
  } catch (error) {
    console.error("[PHASE_GET]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

/**
 * PATCH handler for updating a phase
 */
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const paths = request.url.split("/")
    const phaseId = paths[paths.indexOf("phases") + 1]
    const json = await request.json()

    const phase = await prisma.phase.update({
      where: {
        id: phaseId,
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
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

/**
 * DELETE handler for removing a phase
 */
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const paths = request.url.split("/")
    const phaseId = paths[paths.indexOf("phases") + 1]

    await prisma.phase.delete({
      where: {
        id: phaseId,
      },
    })

    return NextResponse.json(null, { status: 204 })
  } catch (error) {
    console.error("[PHASE_DELETE]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 