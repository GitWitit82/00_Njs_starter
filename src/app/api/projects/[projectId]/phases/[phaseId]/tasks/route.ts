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

    return NextResponse.json(phase.tasks)
  } catch (error) {
    console.error("[TASKS_GET]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const paths = request.url.split("/")
    const projectId = paths[paths.indexOf("projects") + 1]
    const phaseId = paths[paths.indexOf("phases") + 1]
    const { name, description, order, status, assignedToId } = await request.json()

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

    const task = await prisma.projectTask.create({
      data: {
        name,
        description,
        order,
        status,
        assignedToId,
        phaseId
      },
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
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("[TASKS_POST]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 