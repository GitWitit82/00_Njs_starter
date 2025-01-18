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
    const taskId = paths[paths.indexOf("tasks") + 1]

    const task = await prisma.projectTask.findUnique({
      where: {
        id: taskId,
        phaseId: phaseId,
        phase: {
          projectId: projectId
        }
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

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("[TASK_GET]", error)
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
    const taskId = paths[paths.indexOf("tasks") + 1]
    const { name, description, order, status, assignedToId } = await request.json()

    const task = await prisma.projectTask.findUnique({
      where: {
        id: taskId,
        phaseId: phaseId,
        phase: {
          projectId: projectId
        }
      }
    })

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      )
    }

    const updatedTask = await prisma.projectTask.update({
      where: { id: taskId },
      data: {
        name,
        description,
        order,
        status,
        assignedToId
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

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("[TASK_PATCH]", error)
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
    const taskId = paths[paths.indexOf("tasks") + 1]

    const task = await prisma.projectTask.findUnique({
      where: {
        id: taskId,
        phaseId: phaseId,
        phase: {
          projectId: projectId
        }
      }
    })

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      )
    }

    await prisma.projectTask.delete({
      where: { id: taskId }
    })

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("[TASK_DELETE]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 