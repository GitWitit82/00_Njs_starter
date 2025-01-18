import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: { workflowId: string } }
) {
  try {
    // Get the original workflow with phases and tasks
    const originalWorkflow = await prisma.workflow.findUnique({
      where: { id: params.workflowId },
      include: {
        phases: {
          include: {
            tasks: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    if (!originalWorkflow) {
      return new NextResponse("Workflow not found", { status: 404 })
    }

    // Create a new workflow with the same data
    const newWorkflow = await prisma.workflow.create({
      data: {
        name: `${originalWorkflow.name} (Copy)`,
        description: originalWorkflow.description,
        status: originalWorkflow.status,
        phases: {
          create: originalWorkflow.phases.map(phase => ({
            name: phase.name,
            description: phase.description,
            order: phase.order,
            tasks: {
              create: phase.tasks.map(task => ({
                name: task.name,
                description: task.description,
                priority: task.priority,
                manHours: task.manHours,
                order: task.order,
                departmentId: task.departmentId,
                status: task.status
              }))
            }
          }))
        }
      },
      include: {
        phases: {
          include: {
            tasks: true
          }
        }
      }
    })

    return NextResponse.json(newWorkflow)
  } catch (error) {
    console.error("[WORKFLOW_DUPLICATE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 