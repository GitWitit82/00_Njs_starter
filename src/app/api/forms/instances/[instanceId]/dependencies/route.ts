import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { buildFormDependencyGraph } from "@/lib/utils/form-status"

/**
 * GET /api/forms/instances/[instanceId]/dependencies
 * Gets the dependency graph for a form instance
 */
export async function GET(
  req: Request,
  { params }: { params: { instanceId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const instanceId = params.instanceId

    // Get the form instance
    const instance = await prisma.formInstance.findUnique({
      where: { id: instanceId },
      include: {
        project: true
      }
    })

    if (!instance) {
      return new NextResponse("Form instance not found", { status: 404 })
    }

    // Build dependency graph for the project
    const dependencyGraph = await buildFormDependencyGraph(instance.projectId)

    // Get the current instance's dependencies
    const currentNode = dependencyGraph.find(node => node.formId === instanceId)
    if (!currentNode) {
      return new NextResponse("Form not found in dependency graph", { status: 404 })
    }

    // Get blocking dependencies (forms that must be completed first)
    const blockingDependencies = dependencyGraph
      .filter(node => 
        currentNode.dependencies.includes(node.formId) && 
        node.isBlocking && 
        node.status !== "COMPLETED"
      )

    // Get dependent forms (forms that depend on this one)
    const dependentForms = dependencyGraph
      .filter(node => node.dependencies.includes(instanceId))

    const response = {
      currentForm: currentNode,
      blockingDependencies,
      dependentForms,
      canProceed: blockingDependencies.length === 0,
      nextInSequence: dependencyGraph
        .filter(node => 
          node.order && 
          currentNode.order && 
          node.order > currentNode.order
        )
        .sort((a, b) => (a.order || 0) - (b.order || 0))
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("[FORM_DEPENDENCIES]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

/**
 * POST /api/forms/instances/[instanceId]/dependencies
 * Updates form dependencies
 */
export async function POST(
  req: Request,
  { params }: { params: { instanceId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const instanceId = params.instanceId
    const { dependencies } = await req.json()

    // Get the form instance
    const instance = await prisma.formInstance.findUnique({
      where: { id: instanceId },
      include: {
        template: {
          include: {
            completionRequirements: true
          }
        }
      }
    })

    if (!instance) {
      return new NextResponse("Form instance not found", { status: 404 })
    }

    // Update completion requirements
    await prisma.formCompletionRequirement.update({
      where: {
        templateId_phaseId: {
          templateId: instance.templateId,
          phaseId: instance.template.phaseId
        }
      },
      data: {
        dependsOn: {
          set: dependencies.map((id: string) => ({ id }))
        }
      }
    })

    return new NextResponse("Dependencies updated successfully")
  } catch (error) {
    console.error("[UPDATE_DEPENDENCIES]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 