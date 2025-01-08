import { prisma } from "@/lib/prisma"
import { FormInstanceStatus, FormStatus } from "@prisma/client"
import type { 
  FormStatusHistoryEntry, 
  FormCompletionCheckResult,
  FormStatusUpdateRequest,
  FormDependencyNode
} from "@/types/forms"

/**
 * Updates the status of a form instance and creates a history entry
 */
export async function updateFormStatus(
  instanceId: string,
  userId: string,
  update: FormStatusUpdateRequest
): Promise<void> {
  const { status, comments, metadata } = update

  await prisma.$transaction(async (tx) => {
    // Update form instance status
    await tx.formInstance.update({
      where: { id: instanceId },
      data: { 
        status,
        updatedAt: new Date()
      }
    })

    // Create status history entry
    await tx.formStatusHistory.create({
      data: {
        instanceId,
        status,
        changedById: userId,
        comments,
        metadata
      }
    })
  })
}

/**
 * Checks if a form can be completed based on its dependencies
 */
export async function checkFormCompletion(
  instanceId: string
): Promise<FormCompletionCheckResult> {
  const instance = await prisma.formInstance.findUnique({
    where: { id: instanceId },
    include: {
      template: {
        include: {
          completionRequirements: {
            include: {
              dependsOn: true
            }
          }
        }
      }
    }
  })

  if (!instance) {
    throw new Error("Form instance not found")
  }

  const missingRequirements = []
  const nextRequiredForms = []

  // Check dependencies
  for (const req of instance.template.completionRequirements) {
    for (const dep of req.dependsOn) {
      const depInstance = await prisma.formInstance.findFirst({
        where: {
          templateId: dep.templateId,
          projectId: instance.projectId
        }
      })

      if (!depInstance || depInstance.status !== "COMPLETED") {
        missingRequirements.push({
          formId: dep.templateId,
          formName: dep.template.name,
          requirement: "Must be completed before this form"
        })
      }
    }
  }

  // Get next forms in sequence
  const nextForms = await prisma.formInstance.findMany({
    where: {
      projectId: instance.projectId,
      status: { not: "COMPLETED" },
      template: {
        completionRequirements: {
          some: {
            completionOrder: {
              gt: instance.template.completionRequirements[0]?.completionOrder || 0
            }
          }
        }
      }
    },
    include: {
      template: {
        include: {
          completionRequirements: true
        }
      }
    },
    orderBy: {
      template: {
        completionRequirements: {
          completionOrder: "asc"
        }
      }
    },
    take: 5
  })

  nextRequiredForms.push(
    ...nextForms.map(form => ({
      formId: form.templateId,
      formName: form.template.name,
      order: form.template.completionRequirements[0]?.completionOrder || 0
    }))
  )

  return {
    isComplete: missingRequirements.length === 0,
    missingRequirements,
    nextRequiredForms
  }
}

/**
 * Builds a dependency graph for forms in a project
 */
export async function buildFormDependencyGraph(
  projectId: string
): Promise<FormDependencyNode[]> {
  const instances = await prisma.formInstance.findMany({
    where: { projectId },
    include: {
      template: {
        include: {
          completionRequirements: {
            include: {
              dependsOn: true,
              dependentForms: true
            }
          }
        }
      }
    }
  })

  return instances.map(instance => ({
    formId: instance.id,
    formName: instance.template.name,
    status: instance.status,
    dependencies: instance.template.completionRequirements
      .flatMap(req => req.dependsOn)
      .map(dep => dep.id),
    dependents: instance.template.completionRequirements
      .flatMap(req => req.dependentForms)
      .map(dep => dep.id),
    order: instance.template.completionRequirements[0]?.completionOrder,
    isBlocking: instance.template.completionRequirements.some(req => req.requiredForPhase)
  }))
}

/**
 * Gets the status history for a form instance
 */
export async function getFormStatusHistory(
  instanceId: string
): Promise<FormStatusHistoryEntry[]> {
  return prisma.formStatusHistory.findMany({
    where: { instanceId },
    orderBy: { changedAt: "desc" },
    include: {
      changedBy: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  })
}

/**
 * Validates if a status transition is allowed
 */
export function isValidStatusTransition(
  currentStatus: FormInstanceStatus,
  newStatus: FormInstanceStatus
): boolean {
  const allowedTransitions: Record<FormInstanceStatus, FormInstanceStatus[]> = {
    ACTIVE: ["IN_PROGRESS", "ON_HOLD"],
    IN_PROGRESS: ["PENDING_REVIEW", "ON_HOLD", "COMPLETED"],
    PENDING_REVIEW: ["IN_PROGRESS", "COMPLETED", "ON_HOLD"],
    COMPLETED: ["ARCHIVED"],
    ARCHIVED: [],
    ON_HOLD: ["IN_PROGRESS", "ACTIVE"]
  }

  return allowedTransitions[currentStatus]?.includes(newStatus) || false
}

/**
 * Gets the completion percentage of a form instance
 */
export async function getFormCompletionPercentage(
  instanceId: string
): Promise<number> {
  const instance = await prisma.formInstance.findUnique({
    where: { id: instanceId },
    include: {
      responses: {
        orderBy: { createdAt: "desc" },
        take: 1
      },
      template: {
        include: {
          schema: true
        }
      }
    }
  })

  if (!instance || !instance.responses.length) return 0

  const latestResponse = instance.responses[0]
  const schema = instance.template.schema as any
  const totalFields = schema.sections.reduce(
    (total: number, section: any) => total + section.fields.length,
    0
  )

  const completedFields = Object.keys(latestResponse.data).length

  return Math.round((completedFields / totalFields) * 100)
}

/**
 * Gets all forms that are blocking a phase from completion
 */
export async function getPhaseBlockingForms(
  phaseId: string
): Promise<FormDependencyNode[]> {
  const phase = await prisma.projectPhase.findUnique({
    where: { id: phaseId },
    include: {
      tasks: {
        include: {
          formInstances: {
            include: {
              template: {
                include: {
                  completionRequirements: true
                }
              }
            }
          }
        }
      }
    }
  })

  if (!phase) throw new Error("Phase not found")

  const blockingForms = phase.tasks
    .flatMap(task => task.formInstances)
    .filter(instance => 
      instance.template.completionRequirements.some(req => 
        req.requiredForPhase && instance.status !== "COMPLETED"
      )
    )
    .map(instance => ({
      formId: instance.id,
      formName: instance.template.name,
      status: instance.status,
      dependencies: instance.template.completionRequirements
        .flatMap(req => req.dependsOn)
        .map(dep => dep.id),
      dependents: instance.template.completionRequirements
        .flatMap(req => req.dependentForms)
        .map(dep => dep.id),
      order: instance.template.completionRequirements[0]?.completionOrder,
      isBlocking: true
    }))

  return blockingForms
}

/**
 * Checks if a phase can be completed based on form requirements
 */
export async function canCompletePhase(phaseId: string): Promise<{
  canComplete: boolean
  blockingForms: FormDependencyNode[]
}> {
  const blockingForms = await getPhaseBlockingForms(phaseId)
  return {
    canComplete: blockingForms.length === 0,
    blockingForms
  }
}

/**
 * Gets all forms that need attention (e.g., pending review, on hold)
 */
export async function getFormsNeedingAttention(
  projectId: string
): Promise<FormDependencyNode[]> {
  const instances = await prisma.formInstance.findMany({
    where: {
      projectId,
      status: {
        in: ["PENDING_REVIEW", "ON_HOLD"]
      }
    },
    include: {
      template: {
        include: {
          completionRequirements: true
        }
      },
      statusHistory: {
        orderBy: { changedAt: "desc" },
        take: 1
      }
    }
  })

  return instances.map(instance => ({
    formId: instance.id,
    formName: instance.template.name,
    status: instance.status,
    dependencies: instance.template.completionRequirements
      .flatMap(req => req.dependsOn)
      .map(dep => dep.id),
    dependents: instance.template.completionRequirements
      .flatMap(req => req.dependentForms)
      .map(dep => dep.id),
    order: instance.template.completionRequirements[0]?.completionOrder,
    isBlocking: instance.template.completionRequirements.some(req => req.requiredForPhase),
    lastUpdated: instance.statusHistory[0]?.changedAt,
    lastStatus: instance.statusHistory[0]?.status
  }))
}

/**
 * Gets the next forms that should be completed in sequence
 */
export async function getNextFormsInSequence(
  projectId: string,
  limit: number = 5
): Promise<FormDependencyNode[]> {
  const instances = await prisma.formInstance.findMany({
    where: {
      projectId,
      status: { not: "COMPLETED" },
      template: {
        completionRequirements: {
          some: {
            completionOrder: { not: null }
          }
        }
      }
    },
    include: {
      template: {
        include: {
          completionRequirements: {
            orderBy: {
              completionOrder: "asc"
            }
          }
        }
      }
    },
    take: limit
  })

  return instances
    .sort((a, b) => {
      const orderA = a.template.completionRequirements[0]?.completionOrder || 0
      const orderB = b.template.completionRequirements[0]?.completionOrder || 0
      return orderA - orderB
    })
    .map(instance => ({
      formId: instance.id,
      formName: instance.template.name,
      status: instance.status,
      dependencies: instance.template.completionRequirements
        .flatMap(req => req.dependsOn)
        .map(dep => dep.id),
      dependents: instance.template.completionRequirements
        .flatMap(req => req.dependentForms)
        .map(dep => dep.id),
      order: instance.template.completionRequirements[0]?.completionOrder,
      isBlocking: instance.template.completionRequirements.some(req => req.requiredForPhase)
    }))
} 