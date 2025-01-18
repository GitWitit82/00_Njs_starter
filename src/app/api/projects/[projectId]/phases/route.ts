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

    const phases = await prisma.projectPhase.findMany({
      where: { projectId },
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

    return NextResponse.json(phases)
  } catch (error) {
    console.error("[PHASES_GET]", error)
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
    const { name, description, order } = await request.json()

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    const phase = await prisma.projectPhase.create({
      data: {
        name,
        description,
        order,
        projectId
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

    return NextResponse.json(phase)
  } catch (error) {
    console.error("[PHASES_POST]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 