import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { FormBuilder } from "@/components/forms/FormBuilder"
import { Workflow, Department } from "@prisma/client"

type WorkflowWithPhases = Workflow & {
  phases: {
    id: string
    name: string
    description: string | null
    createdAt: Date
    updatedAt: Date
    order: number
    workflowId: string
  }[]
}

async function getWorkflowsAndDepartments(): Promise<{
  workflows: WorkflowWithPhases[]
  departments: Department[]
}> {
  try {
    const [workflows, departments] = await Promise.all([
      prisma.workflow.findMany({
        include: {
          phases: {
            orderBy: {
              order: 'asc',
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      }),
      prisma.department.findMany({
        orderBy: {
          name: "asc",
        },
      }),
    ])

    if (!workflows.length) {
      console.warn('No workflows found in the database')
    }

    if (!departments.length) {
      console.warn('No departments found in the database')
    }

    return { workflows, departments }
  } catch (error) {
    console.error('Error fetching workflows and departments:', error)
    throw new Error('Failed to fetch required data')
  }
}

/**
 * Form template creation page that provides an interface for building new form templates
 */
export default async function NewFormTemplatePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  const { workflows, departments } = await getWorkflowsAndDepartments()

  // Log the data for debugging
  console.log('Available workflows:', workflows.length)
  console.log('Available departments:', departments.length)

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Form Template</h1>
        <p className="text-muted-foreground">
          Design a new form template for your workflow
        </p>
      </div>

      <FormBuilder
        workflows={workflows}
        departments={departments}
        initialData={null}
      />
    </div>
  )
} 