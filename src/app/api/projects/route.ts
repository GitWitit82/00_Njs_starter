import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const projects = await prisma.project.findMany({
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
        },
        phases: true,
        formTemplates: {
          include: {
            versions: {
              where: {
                isCurrent: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error("[PROJECTS_GET]", error)
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
    const { name, description, type, status, metadata } = await request.json()

    const project = await prisma.project.create({
      data: {
        name,
        description,
        type,
        status,
        metadata
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
        },
        phases: true,
        formTemplates: {
          include: {
            versions: {
              where: {
                isCurrent: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error("[PROJECTS_POST]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 