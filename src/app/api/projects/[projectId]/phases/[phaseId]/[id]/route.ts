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
    const projectId = paths[paths.indexOf("projects") + 1]
    const phaseId = paths[paths.indexOf("phases") + 1]

    const phase = await prisma.projectPhase.findUnique({
      where: {
        id: phaseId,
        projectId: projectId
      },
      include: {
        tasks: {
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            formInstances: {
              include: {
                template: true,
                version: true,
                responses: {
                  include: {
                    submittedBy: {
                      select: {
                        id: true,
                        name: true,
                        email: true
                      }
                    },
                    reviewedBy: {
                      select: {
                        id: true,
                        name: true,
                        email: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!phase) {
      return NextResponse.json(
        { error: "Phase not found" },
        { status: 404 }
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

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const paths = request.url.split("/")
    const projectId = paths[paths.indexOf("projects") + 1]
    const phaseId = paths[paths.indexOf("phases") + 1]
    const { name, description, order, status } = await request.json()

    const phase = await prisma.projectPhase.findUnique({
      where: {
        id: phaseId,
        projectId: projectId
      }
    })

    if (!phase) {
      return NextResponse.json(
        { error: "Phase not found" },
        { status: 404 }
      )
    }

    const updatedPhase = await prisma.projectPhase.update({
      where: { id: phaseId },
      data: {
        name,
        description,
        order,
        status
      },
      include: {
        tasks: {
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            formInstances: {
              include: {
                template: true,
                version: true,
                responses: {
                  include: {
                    submittedBy: {
                      select: {
                        id: true,
                        name: true,
                        email: true
                      }
                    },
                    reviewedBy: {
                      select: {
                        id: true,
                        name: true,
                        email: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedPhase)
  } catch (error) {
    console.error("[PHASE_PATCH]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const paths = request.url.split("/")
    const projectId = paths[paths.indexOf("projects") + 1]
    const phaseId = paths[paths.indexOf("phases") + 1]

    const phase = await prisma.projectPhase.findUnique({
      where: {
        id: phaseId,
        projectId: projectId
      }
    })

    if (!phase) {
      return NextResponse.json(
        { error: "Phase not found" },
        { status: 404 }
      )
    }

    await prisma.projectPhase.delete({
      where: { id: phaseId }
    })

    return NextResponse.json({ message: "Phase deleted successfully" })
  } catch (error) {
    console.error("[PHASE_DELETE]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 